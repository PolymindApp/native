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

	handleRemove() {

	}

	handleAdd() {
		const { navigation, route } = this.props;
		const { datasets } = this.state;
		navigation.navigate('NotesData', {
			datasetsContext: this,
			dataset: new Dataset({
				columns: [new DatasetColumn()]
			}),
			datasetIdx: datasets.length,
		});
	}

	// addDataset() {
	// 	const { navigation, route } = this.props;
	// 	navigation.navigate('NotesData', {
	// 		dataset: new Dataset({
	// 			columns: [new DatasetColumn()]
	// 		}),
	// 		onAdd: this._onAdd.bind(this),
	// 		onRemove: this._onRemove.bind(this),
	// 	});
	// }

	onRemove(dataset) {
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
			if (dataset.name.trim().toLowerCase().indexOf(this.state.search.trim().toLowerCase()) !== -1) {
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
		const { search, datasets } = this.state;
		const { navigation } = this.props;

		navigation.setOptions({
			title: I18n.t('title.notes'),
			headerRight: () => datasets.length > 0 && (
				<View style={{marginRight: 10}}>
					{Platform.select({
						ios: (<TouchableOpacity onPress={() => this.handleAdd()} hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}>
							<Text style={{color: 'white'}}>{I18n.t('btn.add')}</Text>
						</TouchableOpacity>),
						default: (<Button onPress={() => this.handleAdd()} icon="plus" color={'white'}>{I18n.t('btn.add')}</Button>)
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

		const filteredDatasets = this.filteredDatasets();

		return (
			<View style={{flex: 1}}>
				{datasets.length > 0 && <SearchBar placeholder={I18n.t('input.filter')} cancelButtonTitle={I18n.t('btn.cancel')} cancelButtonProps={{ color: THEME.primary, buttonStyle: { marginTop: -3 } }} onChangeText={this.updateSearch} value={search} platform={Platform.OS === 'ios' ? 'ios' : 'android'} />}
				<ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps={'handled'} refreshControl={
					<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh.bind(this)} />
				}>
					{datasets.length === 0 && (
						<View style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10}}>
							<Icon name={'file-question'} size={64} style={{opacity: 0.3}}></Icon>
							<Text style={{textAlign: 'center'}} h3>{I18n.t('notes.emptyTitle')}</Text>
							<Text style={{textAlign: 'center'}} h5>{I18n.t('notes.emptyDesc')}</Text>
							<Button mode="contained" onPress={() => this.handleAdd()} delayPressIn={0} style={{marginTop: 10}}>
								{I18n.t('btn.addList')}
							</Button>
						</View>
					)}
					{
						filteredDatasets.map((dataset, datasetIdx) => (
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
								onPress={() => navigation.push('NotesData', {
									datasetsContext: this,
									dataset,
									datasetIdx,
									// dataset,
									// onAdd: this._onAdd.bind(this),
									// onRemove: this._onRemove.bind(this)
								})}
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
