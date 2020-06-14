import React from 'react'
import {ActivityIndicator, Alert, View,} from 'react-native';
import PolymindSDK, { Helpers, Dataset, THEME, DatasetService } from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';
import {Text} from "react-native-elements";
import ContextualOptions from "../../../components/ContextualOptions";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import DataScreenData from "./DataScreenData";
import DataScreenSettings from "./DataScreenSettings";
import TabBarIcon from "../../../components/TabBarIcon";

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
		dataset: new Dataset(),
		originalDataset: new Dataset(),
	};

	optionItems = [
		{ name: I18n.t('btn.cancel'), callback: () => {}, cancel: true, android: false },
		{ icon: 'plus', name: I18n.t('btn.addNote'), callback: () => {
			const { navigation, route } = this.props;
			const dataset = this.state.dataset;
			navigation.navigate('NotesDataEdit', {
				dataset, index: dataset.rows.length, onSave: row => this._onRowSave(row), onRemove: row => this._onRowRemove(row),
			});
		} },
		{ icon: 'delete', name: I18n.t('btn.delete'), callback: () => {
			const { route, navigation } = this.props;
			const dataset = this.state.dataset;
			Alert.alert(I18n.t('alert.deleteDatasetTitle'), I18n.t('alert.deleteDatasetDesc', { name: dataset.name }), [
				{ text: I18n.t('btn.delete'), onPress: () => {
					this.setState({ deleting: true });
					DatasetService.remove(dataset.id).then(() => {
						route.params.onRemove(dataset).then(() => {
							navigation.popToTop();
						});
					});
				}, style: 'destructive' },
				{ text: I18n.t('btn.cancel'), style: "cancel" }
			], { cancelable: false });
		}, destructive: true },
	];

	load() {
		const { dataset } = this.props.route.params;
		if (!dataset.id) {
			this.setState({ dataset, loaded: true, selectedIndex: 0 });
			return new Promise((resolve, reject) => resolve(dataset));
		}

		return $polymind.getDataset(dataset.id).then(dataset => {
			const clone = new Dataset(Helpers.deepClone(dataset));
			this.setState({ dataset, originalDataset: clone, loaded: true, wasValid: dataset.isValid(), selectedIndex: dataset.isValid() ? 0 : 1 });
		});
	}

	updateOriginal(dataset) {
		const clone = new Dataset(Helpers.deepClone(dataset));
		this.setState({ originalDataset: clone });
	}

	componentDidMount() {
		this.setState({ loading: true });
		this.load().finally(() => this.setState({ loading: false }));
	}

	add() {
		const { navigation } = this.props;
		const dataset = this.state.dataset;

		navigation.push('NotesDataEdit', {
			dataset, index: dataset.rows.length,
			onSave: row => this._onRowSave(row),
			onRemove: row => this._onRowRemove(row),
		});
	}

	updateIndex (selectedIndex) {
		this.setState({selectedIndex})
	}

	hasDifferences() {
		return this.state.dataset.getTransactions(this.state.originalDataset).length > 0;
	}

	render() {
		const { navigation } = this.props;
		const dataset = this.state.dataset;
		const isValid = dataset.columns.length > 0 && dataset.id && dataset.isValid() && this.state.wasValid;

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
					<Tab.Screen name="DataData" component={DataScreenData} initialParams={{ dataset, updateOriginal: this.updateOriginal.bind(this), load: this.load.bind(this) }} options={{
						tabBarLabel: I18n.t('sections.data') + ' (' + dataset.rows.length + ')',
					}} listeners={{ tabPress: event => !isValid ? event.preventDefault() : null}} />
					<Tab.Screen name="DataSettings" component={DataScreenSettings} initialParams={{ dataset, updateOriginal: this.updateOriginal.bind(this), hasDifferences: this.hasDifferences.bind(this) }} options={{
						tabBarLabel: I18n.t('sections.settings'),
					}} />
				</Tab.Navigator>
			</View>
		);
	};
}
