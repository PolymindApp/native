import React from 'react'
import {ActivityIndicator, Alert, View,} from 'react-native';
import PolymindSDK, { Helpers, Dataset, THEME, DatasetService } from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';
import {Text} from "react-native-elements";
import ContextualOptions from "../../../components/ContextualOptions";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import DataScreenData from "./DataScreenData";
import DataScreenSettings from "./DataScreenSettings";

const Tab = createMaterialTopTabNavigator();
const $polymind = new PolymindSDK();

export default class DataScreen extends React.Component {

	state = {
		deleting: false,
		wasValid: false,
		loaded: false,
		loading: true,
		saving: false,
		refreshing: false,
		optionsMenu: false,
		dataset: null,
		originalDataset: null,
	};

	optionItems = [
		{ name: I18n.t('btn.cancel'), callback: () => {}, cancel: true, android: false },
		{ icon: 'delete', name: I18n.t('btn.delete'), callback: () => {
			const { route, navigation } = this.props;
			const dataset = this.state.dataset;
			Alert.alert(I18n.t('alert.deleteDatasetTitle'), I18n.t('alert.deleteDatasetDesc', { name: dataset.name }), [
				{ text: I18n.t('btn.delete'), onPress: () => {
					this.setState({ deleting: true });
					DatasetService.remove(dataset.id).then(() => {
						route.params.datasetsContext.onRemove(dataset).then(() => {
							navigation.popToTop();
						});
					});
				}, style: 'destructive' },
				{ text: I18n.t('btn.cancel'), style: "cancel" }
			], { cancelable: false });
		}, destructive: true },
	];

	// _onAdd(dataset, wasNew) {
	// 	return new Promise((resolve, reject) => {
	// 		const { navigation } = this.props;
	// 		this.setState({ dataset, wasValid: dataset.isValid() });
	// 		return this.props.route.params.onAdd(dataset, wasNew).then(() => {
	// 			if (wasNew && this.isValid()) {
	// 				navigation.navigate('DataData', this.getScreenParams());
	// 			}
	// 			navigation.setOptions({
	// 				title: dataset.name
	// 			});
	// 			resolve(dataset);
	// 		});
	// 	});
	// }
	//
	//
	// _onRowRemove(row) {
	// 	const dataset = this.props.route.params.dataset;
	// 	const clone = new Dataset(Helpers.deepClone(dataset));
	// 	const idx = clone.rows.findIndex(item => item.id === row.id);
	// 	clone.rows.splice(idx, 1);
	// 	const transactions = clone.getTransactions(this.state.originalDataset);
	// 	return DatasetService.save(transactions).then(response => {
	// 		this.updateOriginal(clone);
	// 		this.setState({ dataset: clone });
	// 		return response;
	// 	});
	// }

	load() {
		const { dataset } = this.props.route.params;
		if (!dataset.id) {
			const originalDataset = Helpers.deepClone(dataset);
			this.setState({ dataset, loaded: true, selectedIndex: 0, originalDataset });
			return new Promise((resolve, reject) => resolve(dataset));
		}

		return $polymind.getDataset(dataset.id).then(dataset => {
			const originalDataset = Helpers.deepClone(dataset);
			this.setState({ dataset, originalDataset, loaded: true, wasValid: dataset.isValid(), selectedIndex: dataset.isValid() ? 0 : 1 });
		});
	}

	updateOriginal(dataset) {
		const clone = new Dataset(Helpers.deepClone(dataset));
		this.setState({ originalDataset: clone });
		return clone;
	}

	componentDidMount() {
		this.setState({ loading: true });
		this.load().finally(() => this.setState({ loading: false }));
	}

	hasDifferences(dataset) {
		return dataset.getTransactions(this.state.originalDataset).length > 0;
	}

	isValid() {
		const dataset = this.state.dataset;
		return dataset.columns.length > 0 && dataset.id && dataset.isValid() && this.state.wasValid;
	}

	render() {
		const { navigation, route } = this.props;
		const dataset = this.state.dataset;
		// const screenParams = this.getScreenParams();

		let initialRouteName = 'DataData';

		if (this.state.loading) {
			navigation.setOptions({
				title: I18n.t('title.loading'),
				headerRight: null,
			});

			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
				</View>
			);
		}

		if (this.state.saving) {
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
					<Text style={{marginTop: 10, color: THEME.primary}}>{I18n.t('state.saving')}</Text>
				</View>
			);
		}

		if (this.state.deleting) {
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
					<Text style={{marginTop: 10, color: THEME.primary}}>{I18n.t('state.deleting')}</Text>
				</View>
			);
		}

		const isValid = this.isValid(dataset);

		if (this.state.loaded) {
			navigation.setOptions({
				title: dataset.id ? dataset.name : I18n.t('title.newList'),
				headerRight: isValid ? () => (
					<View style={{marginRight: 10, flexDirection: 'row'}}>
						<ContextualOptions items={this.optionItems} disabled={!dataset.id} />
					</View>
				) : null
			});
		}

		let selectedIndex = this.state.selectedIndex;
		const disabledSections = [];
		if (!isValid) {
			disabledSections.push('DataData');
			initialRouteName = 'DataSettings';
		}

		return (
			<View style={{flex: 1}}>
				<Tab.Navigator initialRouteName={initialRouteName} tabBarOptions={{
					indicatorStyle: {
						borderBottomWidth: 2,
						borderColor: THEME.primary,
					}
				}}>
					<Tab.Screen name="DataData" component={DataScreenData} initialParams={{...route.params, dataset: this.state.dataset, originalDataset: this.state.originalDataset, datasetContext: this}} ref={ref => this.refData = ref} options={{
						tabBarLabel: I18n.t('sections.data') + ' (' + dataset.rows.length + ')',
					}} listeners={{ tabPress: event => !isValid ? event.preventDefault() : null}}/>
					<Tab.Screen name="DataSettings" component={DataScreenSettings} initialParams={{...route.params, dataset: this.state.dataset, originalDataset: this.state.originalDataset, datasetContext: this}} options={{
						tabBarLabel: I18n.t('sections.settings'),
					}} />
				</Tab.Navigator>
			</View>
		);
	};
}
