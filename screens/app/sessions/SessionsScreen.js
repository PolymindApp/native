import * as React from 'react';
import {StyleSheet, View, RefreshControl, TouchableOpacity, ActivityIndicator, Dimensions, Slider, Image} from 'react-native';
import {Card, Icon, Text, Divider, Input, ListItem} from 'react-native-elements';
import {Button, IconButton} from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import I18n from '../../../locales/i18n';
import PolymindSDK, { Dataset, THEME, Time, SessionStatsService, AssemblyParameters, DatasetService } from '@polymind/sdk-js';
import RBSheet from "react-native-raw-bottom-sheet";
import moment from "moment/min/moment-with-locales";

const $polymind = new PolymindSDK();

let startDate;
let endDate;

export default class SessionsScreen extends React.Component {

	state = {
		refreshing: false,
		loading: true,
		loadingMore: false,
		drawerLoading: false,
		mayHaveMore: true,
		datasets: [],
		newSession: {
			dataset: new Dataset(),
			params: new AssemblyParameters({
				dataset: {
					answer: false,
					explanation: false,
					image: false,
				},
				filters: {
					sort: ['field', 'id', 'asc'],
					tags: [],
				},
				component: {
					mode: 'manual',
					speed: 10,
					range: 0,
					readQuestion: true,
					readAnswer: true,
				},
			}),
		},
		stats: {},
	}

	handleLoadMore() {
		this.setState({ loadingMore: true });
		this.load(true).finally(() => this.setState({ loadingMore: false }));
	}

	resetDates() {
		startDate = moment().startOf('day').subtract(1, 'month');
		endDate = moment().add(1, 'days').startOf('day');
	}

	load(loadMore = false) {
		return SessionStatsService.getAll('live', startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')).then(stats => {

			const items = Object.keys(stats.daily);
			const mayHaveMore = items.length > 0;
			startDate = moment(startDate).subtract(1, 'month');
			endDate = moment(startDate);

			let newStats = loadMore ? this.state.stats : {};
			Object.assign(newStats, stats.daily);

			this.setState({ mayHaveMore, stats: newStats, offset: (this.state.offset + this.state.limit) });
		}).catch(err => {
			console.log(err);
		});
	}

	componentDidMount() {

		const { navigation } = this.props;

		navigation.setOptions({
			title: I18n.t('title.sessions'),
			// headerLeft: () => (
			// 	<TouchableOpacity style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 10 }} onPress={() => navigation.push('ProfilePage', { slug: 'help-sessions' })} hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}>
			// 		<Text style={{color: 'white'}}>{I18n.t('btn.help')}</Text>
			// 	</TouchableOpacity>
			// ),
		});

		this.resetDates();

		const callback = () => {
			this.setState({ loading: true });
			this.load().then(() => this.loadDatasets()).finally(() => {
				this.setState({ loading: false });
			});
		};

		this._navigationFocus = navigation.addListener('focus', () => {
			if (global.mustRefreshSession) {
				this.resetDates();
				global.mustRefreshSession = false;
				callback();
			}
		});
		callback();
	}

	componentWillUnmount() {
		this._navigationFocus();
	}

	onRefresh() {

		this.resetDates();

		this.setState({ refreshing: true });
		this.load().then(() => {
			this.setState({ refreshing: false });
			return this.loadDatasets();
		});
	}

	startSession(settings, dataset) {
		this.RBSheet.close();

		$polymind.getDataset(dataset.id).then(dataset => {

			settings.dataset = dataset;
			settings.params.dataset.question = dataset.columns[0].guid;
			if (dataset.columns.length > 1) {
				settings.params.dataset.answer = dataset.columns[1].guid;
			} else {
				this.state.newSession.params.component.mode = 'linearPassive';
			}

			// If 0 or 55, it means Unlimited
			if ([0, 55].indexOf(settings.params.component.range) !== -1) {
				settings.params.component.range = 0;
			}

			this.props.navigation.push('SessionsPlayer', { settings })
		});
	}

	loadDatasets() {
		return DatasetService.getSimpleList(global.user.id).then(datasets => {
			datasets = datasets.sort((a,b) => (a.created_on > b.created_on) ? 1 : ((b.created_on > a.created_on) ? -1 : 0)).reverse();
			this.setState({ datasets });
		});
	}

	openDrawer() {
		this.RBSheet.open();
	}

	formattedSessions() {
		const dates = [];

		for (let [date, daily] of Object.entries(this.state.stats)) {
			const dateItem = {
				timestamp: moment(date).unix(),
				name: moment(date).format('ddd').toUpperCase().replace('.', ''),
				day: parseInt(moment(date).local().format('D')),
				year: parseInt(moment(date).local().format('YYYY')),
				month: moment(date).local().format('MMMM'),
				totalTags: daily.totalTags,
				totalTime: daily.totalTime,
				items: [],
			};

			dateItem.month = dateItem.month.substring(0, 1).toUpperCase() + dateItem.month.substring(1);

			for (let [sessionId, item] of Object.entries(daily.session)) {
				const item = daily.session[sessionId];
				item.id = sessionId;
				item.timestamp = moment.utc(item.start_date).local().unix();
				item.startTime = moment.utc(item.start_date).local().format('HH:mm');
				item.endTime = moment.utc(item.end_date).local().format('HH:mm');
				item.durationInSeconds = moment.duration(item.duration).asSeconds();

				const totalStatus = (item.totalTags.hard || 0) + (item.totalTags.unsure || 0) + (item.totalTags.easy || 0);
				item.statusPercentages = {
					easy: totalStatus > 0 ? ((item.totalTags.easy || 0) * 100 / totalStatus) : 0,
					unsure: totalStatus > 0 ? ((item.totalTags.unsure || 0) * 100 / totalStatus) : 0,
					hard: totalStatus > 0 ? ((item.totalTags.hard || 0) * 100 / totalStatus) : 0,
				};

				dateItem.items.push(item);
			}
			dateItem.items.sort((a, b) => (a.timestamp > b.timestamp) ? 1 : -1).reverse();
			dates.push(dateItem);
		}
		dates.sort((a, b) => (a.timestamp > b.timestamp) ? 1 : -1).reverse();

		const yearsMonths = [];
		dates.forEach(date => {
			let yearIdx = yearsMonths.findIndex(item => item.year === date.year);
			if (yearIdx === -1) {
				yearsMonths.push({
					year: date.year,
					months: []
				});
				yearIdx = yearsMonths.length - 1;
			}
			let monthIdx = yearsMonths[yearIdx].months.findIndex(month => month.month === date.month);
			if (monthIdx === -1) {
				yearsMonths[yearIdx].months.push({
					month: date.month,
					days: []
				});
				monthIdx = yearsMonths[yearIdx].months.length - 1;
			}
			yearsMonths[yearIdx].months[monthIdx].days.push(date);
		});

		return yearsMonths;
	}

	render() {
		const { navigation } = this.props;

		if (this.state.loading) {
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
				</View>
			);
		}

		const years = this.formattedSessions();
		const height = Math.max(Dimensions.get('window').height, Dimensions.get('window').width);

		return (
			<View style={{flex: 1, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0, 0, 0, 0.075)'}}>
				<RBSheet
					ref={ref => this.RBSheet = ref}
					height={height / 1.2}
					animationType={'fade'}
					closeOnDragDown={true}
					customStyles={{
						container: {
							borderTopLeftRadius: 15,
							borderTopRightRadius: 15,
						}
					}}
				>
					<View style={{padding: 10, flex: 1, justifyContent: 'flex-end'}}>
						<View style={{flex: 1}}>
							<Text style={{marginBottom: 10, textAlign: 'center', fontFamily: 'geomanist'}} h4>
								{I18n.t('session.drawerSelectList')}
							</Text>
							<ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'handled'}>
								{this.state.datasets.filter(dataset => dataset.total_rows > 0).map((dataset, datasetIdx) => (
									<ListItem
										key={datasetIdx}
										leftIcon={<Icon
											name={dataset.icon.substring(4) || 'database'}
											color={THEME.primary}
											containerStyle={{width: 32}}
										/>}
										title={dataset.name}
										subtitle={I18n.t('session.remainingRows', { count: dataset.remaining_rows })}
										subtitleStyle={{color: 'rgba(0, 0, 0, 0.33)'}}
										topDivider={datasetIdx !== 0}
										delayPressIn={0}
										disabled={dataset.remaining_rows === 0}
										onPress={() => {
											this.startSession(this.state.newSession, dataset);
										}}
										chevron
									/>
								))}
							</ScrollView>
						</View>
					</View>
				</RBSheet>
				<ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps={'handled'} refreshControl={
					<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh.bind(this)} />
				}>
					{this.state.datasets.length === 0 ? (
						<View style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10}}>
							<Icon name={'file-question'} size={64} style={{opacity: 0.3}}></Icon>
							<Text style={{textAlign: 'center'}} h3>{I18n.t('session.noDatasetTitle')}</Text>
							<Text style={{textAlign: 'center'}} h5>{I18n.t('session.noDatasetDesc')}</Text>
						</View>
					) : years.length === 0 && (
						<View style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10}}>
							<Icon name={'file-question'} size={64} style={{opacity: 0.3}}></Icon>
							<Text style={{textAlign: 'center'}} h3>{I18n.t('session.emptyTitle')}</Text>
							<Text style={{textAlign: 'center'}} h5>{I18n.t('session.emptyDesc')}</Text>
						</View>
					)}
					{years.map((year, yearIdx) => (
						<View key={year.year} style={{padding: 10}}>
							{year.months.map((month, monthIdx) => (
								<View key={year.year + month.month}>

									<View style={{paddingVertical: 20, paddingTop: monthIdx === 0 ? 0 : 20}}>
										{monthIdx === 0 && years.length > 0 && (<Text style={{color: THEME.primary, fontFamily: 'open-sans'}} h2>{year.year}</Text>)}
										<Text style={{color: THEME.primary, fontWeight: '100', fontFamily: 'open-sans-light' }} h3>{month.month}</Text>
									</View>

									{month.days.map((date, dateIdx) => (
										<View style={{ ...styles.dateItem, marginTop: dateIdx === 0 ? 0 : 20}} key={dateIdx}>
											<View style={styles.dateItemLeft}>
												<Text style={styles.dateText}>{date.name}</Text>
												<View style={styles.dateCircle}>
													<Text style={styles.dateCircleText}>{date.day}</Text>
												</View>
											</View>
											<View style={styles.dateItemRight}>
												{date.items.map((session, sessionIdx) => (
													<TouchableOpacity onPress={() => {navigation.push('SessionsStats', { session })}} key={sessionIdx}>
															<Card containerStyle={{marginBottom: sessionIdx < date.items.length - 1 ? -10 : 0}} key={sessionIdx}>
																<View style={{marginBottom: 5}}>
																	<Text style={{fontWeight: 'bold'}}>{session.title}</Text>
																</View>
																<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
																	<Text>{Time.duration(session.durationInSeconds, false)}</Text>
																	<Text style={styles.fromTo}>{session.startTime + ' - ' + session.endTime}</Text>
																</View>
																<View style={{flex: 1, flexDirection: 'row', marginHorizontal: -15, marginBottom: -15, marginTop: 15}}>
																	<View style={{backgroundColor: THEME.success, height: 3, flex: session.statusPercentages.easy}} />
																	<View style={{backgroundColor: THEME.warning, height: 3, flex: session.statusPercentages.unsure}} />
																	<View style={{backgroundColor: THEME.error, height: 3, flex: session.statusPercentages.hard}} />
																</View>
															</Card>
													</TouchableOpacity>
												))}
											</View>
										</View>))}
								</View>))}
						</View>
					))}

					{/*{this.state.mayHaveMore && <View style={{padding: 10}}>*/}
					{/*	<Button mode="outline" onPress={() => this.handleLoadMore()} loading={this.state.loadingMore} disabled={this.state.loadingMore} delayPressIn={0}>*/}
					{/*		{I18n.t('btn.loadMore')}*/}
					{/*	</Button>*/}
					{/*</View>}*/}
				</ScrollView>

				{this.state.datasets.length > 0 && (
					<View style={{flex: 0, marginHorizontal: 10, marginBottom: 10}}>
						<Divider style={{marginBottom: 10}} />
						<Button mode="contained" onPress={() => this.openDrawer()} loading={this.state.drawerLoading} disabled={this.state.drawerLoading} delayPressIn={0}>
							{I18n.t('btn.start')}
						</Button>
					</View>
				)}
			</View>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
	},
	dateItem: {
		flexGrow: 1,
		flexDirection: 'row',
	},
	dateItemLeft: {

	},
	dateItemRight: {
		margin: -10,
		marginLeft: 0,
		marginBottom: 0,
		marginRight: -15,
		flex: 1,
	},
	dateText: {
		color: THEME.primary,
		marginBottom: 5,
		textAlign: 'center',
	},
	dateCircle: {
		backgroundColor: THEME.primary,
		borderRadius: 100,
		width: 38,
		height: 38,
		flexDirection: 'column',
		justifyContent: 'center',
		lineHeight: 20,
		fontSize: 20,
	},
	dateCircleText: {
		textAlign: 'center',
		color: 'white',
	},
	fromTo: {
		color: 'rgba(0, 0, 0, 0.33)',
	},
	handle: {
		width: 40,
		height: 5,
		borderRadius: 10,
		backgroundColor: 'grey',
	}
});
