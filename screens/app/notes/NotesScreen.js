import React from 'react'
import {ActivityIndicator, Platform, RefreshControl, StyleSheet, TouchableOpacity, View} from 'react-native';
import {SearchBar, ListItem, Icon, Text} from "react-native-elements";
import {Button} from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import Storage from '../../../components/storage';
import PolymindSDK, { THEME, Dataset, DatasetColumn } from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';

const $polymind = new PolymindSDK();

export default class NotesScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			search: '',
			loading: false,
			refreshing: false,
			datasets: [],
		}
	}

	updateSearch = search => {
		this.setState({ search });
	};

	addDataset() {
		const { navigation, route } = this.props;
		navigation.navigate('NotesData', {
			dataset: new Dataset({
				columns: [new DatasetColumn()]
			}), onAdd: this._onAdd.bind(this), onRemove: this._onRemove.bind(this)
		});
	}

	_onAdd(dataset, wasNew) {
		return new Promise((resolve, reject) => {
			const datasets = this.state.datasets;
			if (wasNew) {
				datasets.push(dataset);
			} else {
				const idx = datasets.findIndex(item => item.id === dataset.id);
				datasets[idx] = dataset;
			}
			this.setState({ datasets });
			resolve(datasets);
		});
	}

	_onRemove(dataset) {
		return new Promise((resolve, reject) => {
			const datasets = this.state.datasets;
			const idx = datasets.findIndex(item => item.id === dataset.id);
			datasets.splice(idx, 1);
			this.setState({ datasets });
			resolve();
		});
	}

	load() {
		return $polymind.getDatasets().then(datasets => {
			this.setState({ datasets });
		});
	}

	filteredDatasets() {
		return this.state.datasets.filter(dataset => {
			if (dataset.name.trim().toLowerCase().indexOf(this.state.search) !== -1) {
				return true;
			}
		});
	}

	onRefresh() {
		this.setState({ refreshing: true });
		this.load().finally(() => this.setState({ refreshing: false }));
	}

	componentDidMount() {
		this.setState({ loading: true });
		this.load().finally(() => this.setState({ loading: false }));
	}

	render() {
		const { search } = this.state;
		const { navigation } = this.props;

		navigation.setOptions({
			title: I18n.t('title.notes'),
			headerRight: () => (
				<View style={{marginRight: 10}}>
					{Platform.select({
						ios: (<TouchableOpacity onPress={() => this.addDataset()}>
							<Text style={{color: 'white'}}>{I18n.t('btn.add')}</Text>
						</TouchableOpacity>),
						default: (<Button onPress={() => this.addDataset()} icon="plus" color={'white'}>{I18n.t('btn.add')}</Button>)
					})}
				</View>
			)
		});

		if (this.state.loading) {
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
				</View>
			);
		}

		return (
			<View style={{flex: 1}}>
				<SearchBar placeholder={I18n.t('input.filter')} cancelButtonTitle={I18n.t('btn.cancel')} cancelButtonProps={{ color: THEME.primary, buttonStyle: { marginTop: -7 } }} onChangeText={this.updateSearch} value={search} platform={Platform.OS === 'ios' ? 'ios' : 'android'} />
				<ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'} refreshControl={
					<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh.bind(this)} />
				}>
					{
						this.filteredDatasets().map((dataset, datasetIdx) => (
							<ListItem
								key={dataset.guid}
								leftIcon={<Icon
									name={dataset.icon.substring(4) || 'database'}
									color={THEME.primary}
									containerStyle={{width: 32}}
								/>}
								title={dataset.name}
								topDivider={datasetIdx === 0}
								delayPressIn={0}
								bottomDivider
								chevron={true}
								onPress={() => navigation.push('NotesData', { dataset, onAdd: this._onAdd.bind(this), onRemove: this._onRemove.bind(this) })}
							/>
						))
					}
				</ScrollView>
			</View>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
