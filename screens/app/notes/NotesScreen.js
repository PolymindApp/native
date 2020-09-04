import React from 'react'
import {
	ActivityIndicator, Animated,
	Dimensions,
	Image,
	Platform,
	RefreshControl,
	StyleSheet,
	TouchableOpacity,
	View
} from 'react-native';
import {SearchBar, ListItem, Icon, Text} from "react-native-elements";
import {Button, IconButton} from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import PolymindSDK, { THEME, Dataset, DatasetColumn, Color } from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';
import Card from "../../../components/Card";
import placeholder from '../../../assets/images/placeholder.png';

const $polymind = new PolymindSDK();

export default class NotesScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			search: '',
			internet: true,
			loading: true,
			refreshing: false,
			datasets: [],
			scrollY: new Animated.Value(0),
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
		const locale = I18n.locale.substring(0, 2);

		navigation.navigate('NotesData', {
			datasetsContext: this,
			dataset: new Dataset({
				columns: [new DatasetColumn({
					name: I18n.t('field.question'),
				}), new DatasetColumn({
					name: I18n.t('field.answer'),
				})]
			}),
			datasetIdx: datasets.length,
		});
	}

	onRemove(dataset) {
		return new Promise((resolve, reject) => {
			const datasets = this.state.datasets;
			const idx = datasets.findIndex(item => item.id === dataset.id);
			datasets.splice(idx, 1);
			this.setState({ datasets });
			global.mustRefreshSession = true;
			resolve();
		});
	}

	load() {
		return $polymind.getDatasets(global.user.id).then(datasets => {
			this.setState({ datasets });
		}).catch(err => {
			console.log(err);
		});
	}

	getImages(dataset) {
		let images = [];
		dataset.rows.reverse();
		dataset.rows.forEach(row => {
			if (images.length < 5 && row.image?.private_hash) {
				images.push({ uri: $polymind.getThumbnailByPrivateHash(row.image.private_hash, 'avatar') });
			}
		});
		dataset.rows.reverse();
		if (images.length === 0) {
			images.push(placeholder);
		}
		return images;
	}

	getTags(dataset) {
		const tags = [];
		let total = 0;
		dataset.rows.forEach(row => {
			row.tags.forEach(tag => {
				let index = tags.findIndex(item => item.name === tag);
				if (index === -1) {
					const color = (THEME.tags[tag] && THEME.tags[tag].color) || ('#' + Color.stringToHex(tag));
					const dark = (THEME.tags[tag] && THEME.tags[tag].dark )|| Color.isDark(color);
					tags.push({
						name: tag,
						color,
						dark,
						count: 0,
					});
					index = tags.length - 1;
				}
				tags[index].count++;
				total++;
			});
		});
		tags.forEach(tag => {
			tag.percent = tag.count * 100 / total;
		});
		return tags;
	}

	filteredDatasets() {
		const datasets = this.state.datasets.filter(dataset => {
			if (dataset.name.trim().toLowerCase().indexOf(this.state.search.trim().toLowerCase()) !== -1) {
				return true;
			}
		});

		return datasets.sort((a,b) => (a.created_on > b.created_on) ? 1 : ((b.created_on > a.created_on) ? -1 : 0)).reverse();
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
			// headerLeft: () => (
			// 	<TouchableOpacity style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 10 }} onPress={() => navigation.push('ProfilePage', { slug: 'help-notes', backgroundColor: 'white' })} hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}>
			// 		<Text style={{color: 'white'}}>{I18n.t('btn.help')}</Text>
			// 	</TouchableOpacity>
			// ),
			headerRight: () => datasets.length > 0 && (
				<View>
					{Platform.select({
						ios: (<TouchableOpacity style={{marginRight: 10}} onPress={() => this.handleAdd()} hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}>
							<Text style={{color: 'white'}}>{I18n.t('btn.add')}</Text>
						</TouchableOpacity>),
						default: (<Button style={{marginRight: 5}} onPress={() => this.handleAdd()} icon="plus" color={'white'}>{I18n.t('btn.add')}</Button>)
					})}
				</View>
			),
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
			<View style={{flex: 1, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0, 0, 0, 0.075)'}}>

				<Animated.ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps={'handled'} refreshControl={
					<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh.bind(this)} />
				} onScroll={Animated.event(
					[{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
					{ useNativeDriver: true }
				)}>
					{datasets.length > 0 && (
						<SearchBar
							style={{backgroundColor: 'red'}}
							placeholder={I18n.t('input.filter')}
							cancelButtonTitle={I18n.t('btn.cancel')}
							cancelButtonProps={{ color: THEME.primary, buttonStyle: { marginTop: -3 } }}
							onChangeText={this.updateSearch}
							value={search}
							platform={Platform.OS === 'ios' ? 'ios' : 'android'}
						/>
					)}
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
					<View style={{flexDirection: 'row', flexWrap: 'wrap', margin: 5}}>
						{filteredDatasets.map((dataset, datasetIdx) => (

							<View key={datasetIdx} style={{ width: '50%', padding: 5 }}>
								<Card onPress={() => navigation.push('NotesData', {
										datasetsContext: this,
										dataset,
										datasetIdx,
									})}
									images={{
										items: this.getImages(dataset),
										width: Dimensions.get('window').width / 2 - 15,
										height: 100,
									}}
								>
									{/*TAGS PERCENTAGE*/}
									<View style={{flex: 1, flexDirection: 'row', height: 3, backgroundColor: '#ccc'}}>
										{this.getTags(dataset).map(tag => (
											<View style={{backgroundColor: tag.color, height: 3, flex: tag.percent}} />
										))}
									</View>

									<View style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}>
										<Icon
											name={dataset.icon.substring(4) || 'database'}
											color={THEME.primary}
											containerStyle={{width: 32}}
										/>
										<View style={{marginLeft: 5, flex: 1 }}>
											<Text style={{flex:1}} numberOfLines={1} ellipsizeMode='tail'>{dataset.name}</Text>
											<Text style={{flex:1}} numberOfLines={1} ellipsizeMode='tail' style={{opacity: 0.33}}>{I18n.t('notes.totalRows', { count: dataset.total_rows })}</Text>
										</View>
									</View>
								</Card>
							</View>
						))}
					</View>
				</Animated.ScrollView>
			</View>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.05)'
	},
	desc: {
		margin: 10,
		marginTop: 0,
		color: 'rgba(0, 0, 0, 0.33)',
		fontSize: 12,
	}
});
