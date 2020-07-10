import * as React from 'react';
import {StyleSheet, View, RefreshControl, TouchableOpacity, ActivityIndicator, Dimensions, Slider} from 'react-native';
import {Card, Icon, Text, Divider, Input, ListItem} from 'react-native-elements';
import { Button } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import I18n from '../../../locales/i18n';
import PolymindSDK, { Dataset, THEME, Time, SessionStatsService, AssemblyParameters } from '@polymind/sdk-js';
import RBSheet from "react-native-raw-bottom-sheet";
import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/es';
import 'moment/locale/it';

const $polymind = new PolymindSDK();
let sliderTimeout;

let startDate = moment().startOf('day').subtract(1, 'month');
let endDate = moment().endOf('day');

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
				component: {
					mode: 'linearAssertive',
					speed: 5,
					range: 20,
					readQuestion: true,
					readAnswer: true,
				},
			}),
		},
		stats: {},
		step: 1,
	}

	sessionModes = [
		{ key: 'manual', title: I18n.t('session.types.manualTitle'), desc: I18n.t('session.types.manualDesc'), icon: 'hand', color: THEME.success, },
		{ key: 'linearPassive', title: I18n.t('session.types.autoPassiveTitle'), desc: I18n.t('session.types.autoPassiveDesc'), icon: 'play-speed', color: THEME.success },
		{ key: 'linearAssertive', title: I18n.t('session.types.autoAssertiveTitle'), desc: I18n.t('session.types.autoAssertiveDesc'), icon: 'play-speed', color: THEME.warning },
	];

	handleLoadMore() {
		this.setState({ loadingMore: true });
		this.load(true).finally(() => this.setState({ loadingMore: false }));
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
		});
	}

	componentDidMount() {

		const { navigation } = this.props;

		const callback = () => {
			this.setState({ loading: true });
			this.load().then(() => this.loadDatasets()).finally(() => {
				this.setState({ loading: false });
			});
		};

		this._navigationFocus = navigation.addListener('focus', () => {
			if (global.mustRefreshSession) {
				startDate = moment().startOf('day').subtract(1, 'month');
				endDate = moment().endOf('day');
				global.mustRefreshSession = false;
				callback()
			}
		});
		callback();
	}

	componentWillUnmount() {
		this._navigationFocus();
	}

	onRefresh() {

		startDate = moment().startOf('day').subtract(1, 'month');
		endDate = moment().endOf('day');

		this.setState({ refreshing: true });
		this.load().then(() => {
			this.setState({ refreshing: false });
			return this.loadDatasets();
		});
	}

	startSession(settings) {
		this.RBSheet.close();

		// If 0 or 55, it means Unlimited
		if ([0, 55].indexOf(settings.params.component.range) !== -1) {
			settings.params.component.range = 0;
		}
		this.props.navigation.push('SessionsPlayer', { settings })
	}

	loadDatasets() {
		return $polymind.getDatasets().then(datasets => {
			datasets = datasets.sort((a,b) => (a.created_on > b.created_on) ? 1 : ((b.created_on > a.created_on) ? -1 : 0)).reverse();
			this.setState({ datasets });
		});
	}

	openDrawer() {
		this.setState({ step: 1 });
		this.RBSheet.open();
	}

	formattedSessions() {
		const dates = [];

		for (let [date, daily] of Object.entries(this.state.stats)) {
			const dateItem = {
				timestamp: moment(date).unix(),
				name: moment(date).format('ddd').toUpperCase().replace('.', ''),
				day: parseInt(moment.utc(date).local().format('D')),
				year: parseInt(moment.utc(date).local().format('YYYY')),
				month: moment.utc(date).local().format('MMMM'),
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

	setStep(index) {
		this.setState({ step: index });
	}

	stepBack() {
		let step = this.state.step - 1;

		if (step === 3 && this.state.newSession.dataset.columns.length <= 2) {
			step = 2;
		}

		this.setState({ step });
	}

	canStepBack() {
		return this.state.step !== 4;
	}

	stepNext() {
		const step = this.state.step + 1;
		this.setState({ step });
	}

	canStepNext() {
		return this.state.step !== 3
			|| !this.state.newSession.params.dataset.question
			|| this.state.newSession.params.dataset.answer === false;
	}

	render() {
		const { navigation } = this.props;

		navigation.setOptions({
			title: I18n.t('title.sessions')
		});

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
			<View style={{flex: 1}}>
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
						{this.state.step === 1 && (
							<View style={{flex: 1}}>
								<Text style={{marginBottom: 10}} h4>
									{I18n.t('session.drawerSelectList')}
								</Text>
								<ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'handled'}>
									{this.state.datasets.map((dataset, datasetIdx) => (
										<ListItem
											key={dataset.guid}
											leftIcon={<Icon
												name={dataset.icon.substring(4) || 'database'}
												color={THEME.primary}
												containerStyle={{width: 32}}
											/>}
											title={dataset.name}
											topDivider={datasetIdx !== 0}
											delayPressIn={0}
											onPress={() => {
												const newSession = this.state.newSession;
												newSession.dataset = dataset;

												// this.setState({ newSession });
												// this.setStep(2);

												const columns = this.state.newSession.dataset.columns;
												newSession.params.dataset.question = columns[0].guid;
												if (columns.length > 1) {
													newSession.params.dataset.answer = columns[1].guid;
												} else {
													newSession.params.component.mode = 'linearPassive';
												}

												this.startSession(this.state.newSession);
											}}
											chevron
										/>
									))}
								</ScrollView>
							</View>
						)}
						{this.state.step === 2 && (
							<View style={{flex: 1}}>
								<Text style={{marginBottom: 10}} h4>
									{I18n.t('session.chooseType')}
								</Text>
								<ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'handled'}>
									{this.sessionModes.map((mode, modeIdx) => (
										<ListItem
											key={modeIdx}
											leftIcon={<Icon
												name={mode.icon}
												color={mode.color}
												containerStyle={{width: 32}}
											/>}
											title={mode.title}
											subtitle={mode.desc}
											titleStyle={{color: mode.color}}
											topDivider={modeIdx !== 0}
											delayPressIn={0}
											chevron
											onPress={() => {

												const newSession = this.state.newSession;
												newSession.params.component.mode = mode.key;

												const params = this.state.newSession.params.dataset;
												if (newSession.dataset.columns.length === 1) {
													params.question = newSession.dataset.columns[0].guid;
												} else if (newSession.dataset.columns.length === 2) {
													params.question = newSession.dataset.columns[0].guid;
													params.answer = newSession.dataset.columns[1].guid;
												}

												this.setState({ newSession });
												this.setStep(newSession.dataset.columns.length <= 2 ? 4 : 3);
											}}
										/>
									))}
								</ScrollView>
							</View>
						)}
						{this.state.step === 3 && (
							<View style={{flex: 1}}>
								<Text style={{marginBottom: 10}} h4>
									{I18n.t('session.chooseFields')}
								</Text>

								<ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'handled'}>
									<Text style={{marginTop: 15, marginBottom: 10}} h5>
										{I18n.t('session.question')}
									</Text>

									{this.state.newSession.dataset.columns.map((column, columnIdx) => (
										<ListItem
											key={column.guid}
											title={column.name}
											topDivider={columnIdx !== 0}
											checkmark={this.state.newSession.params.dataset.question === column.guid}
											delayPressIn={0}
											onPress={() => {
												const newSession = this.state.newSession;
												newSession.params.dataset.question = newSession.params.dataset.question === column.guid ? '' : column.guid;
												if (newSession.params.dataset.answer === newSession.params.dataset.question) {
													newSession.params.dataset.answer = false;
												}
												this.setState({ newSession });
											}}
										/>
									))}

									<Text style={{marginTop: 15, marginBottom: 10}} h5>
										{I18n.t('session.answer')}
									</Text>
									{this.state.newSession.dataset.columns.map((column, columnIdx) => (
										<ListItem
											key={column.guid}
											title={column.name}
											topDivider={columnIdx !== 0}
											delayPressIn={0}
											titleStyle={{ opacity: column.guid === this.state.newSession.params.dataset.question ? 0.3 : 1}}
											disabled={column.guid === this.state.newSession.params.dataset.question}
											checkmark={this.state.newSession.params.dataset.answer === column.guid}
											onPress={() => {
												const newSession = this.state.newSession;
												newSession.params.dataset.answer = newSession.params.dataset.answer === column.guid ? '' : column.guid;
												this.setState({ newSession });
											}}
										/>
									))}
									<ListItem
										key={'none'}
										title={I18n.t('session.noAnswer')}
										leftIcon={{name: 'block-helper'}}
										topDivider
										checkmark={this.state.newSession.params.dataset.answer === null}
										delayPressIn={0}
										onPress={() => {
											const newSession = this.state.newSession;
											newSession.params.dataset.answer = null;
											this.setState({ newSession });
										}}
									/>
								</ScrollView>
							</View>
						)}
						{this.state.step === 4 && (
							<View style={{flex: 1}}>
								<Text style={{marginBottom: 10}} h4>
									{I18n.t('session.chooseSettings')}
								</Text>
								<ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'handled'}>
									{this.state.newSession.params.component.mode !== 'manual' && (
										<ListItem
											key={'speed'}
											title={<View>
												<Text style={{color: THEME.primary, fontSize: 16}}>{I18n.t('session.speed')}</Text>
												<Slider
													minimumValue={5}
													maximumValue={20}
													value={this.state.newSession.params.component.speed}
													onValueChange={value => {
														clearTimeout(sliderTimeout);
														sliderTimeout = setTimeout(() => {
															const newSession = this.state.newSession;
															newSession.params.component.speed = Math.ceil(parseInt(value) / 5) * 5;
															this.setState({ newSession });
														}, 100);
													}}
													minimumTrackTintColor={THEME.primary}
												/>
												<Text>{I18n.t('session.speedSeconds', { seconds: this.state.newSession.params.component.speed })}</Text>
											</View>}
											leftIcon={{name: 'speedometer', color: THEME.primary}}
											delayPressIn={0}
										/>
									)}

									<ListItem
										key={'range'}
										title={<View>
											<Text style={{color: THEME.primary, fontSize: 16}}>{I18n.t('session.range')}</Text>
											<Slider
												minimumValue={0}
												maximumValue={55}
												value={this.state.newSession.params.component.range}
												onValueChange={value => {
													clearTimeout(sliderTimeout);
													sliderTimeout = setTimeout(() => {
														const newSession = this.state.newSession;
														newSession.params.component.range = Math.ceil(parseInt(value) / 5) * 5;
														this.setState({ newSession });
													}, 100);
												}}
												minimumTrackTintColor={THEME.primary}
											/>
											<Text>{[0, 55].indexOf(this.state.newSession.params.component.range) === -1 ? I18n.t('session.rangeDesc', {
												range: this.state.newSession.params.component.range
											}) : I18n.t('session.rangeUnlimited')}</Text>
										</View>}
										leftIcon={{name: 'ray-start-end', color: THEME.primary}}
										delayPressIn={0}
										topDivider
									/>

									<ListItem
										key={'pronounceQuestion'}
										title={I18n.t('session.pronounceQuestionTitle')}
										titleStyle={{color: THEME.primary}}
										leftIcon={{name: 'voice', color: THEME.primary}}
										subtitle={I18n.t('session.pronounceQuestionDesc')}
										checkmark={{ checked: this.state.newSession.params.component.readQuestion }}
										topDivider
										delayPressIn={0}
										onPress={() => {
											const newSession = this.state.newSession;
											newSession.params.component.readQuestion = !newSession.params.component.readQuestion;
											this.setState({ newSession });
										}}
									/>
									{this.state.newSession.params.dataset.answer && (<ListItem
										key={'pronounceAnswer'}
										title={I18n.t('session.pronounceAnswerTitle')}
										titleStyle={{color: THEME.primary}}
										leftIcon={{name: 'voice', color: THEME.primary}}
										subtitle={I18n.t('session.pronounceAnswerDesc')}
										checkmark={{ checked: this.state.newSession.params.component.readAnswer }}
										delayPressIn={0}
										topDivider
										onPress={() => {
											const newSession = this.state.newSession;
											newSession.params.component.readAnswer = !newSession.params.component.readAnswer;
											this.setState({ newSession });
										}}
									/>)}
								</ScrollView>
							</View>
						)}
						{/*<View style={{ height: 45 }}>*/}
						{/*	<Divider style={{marginBottom: 10}} />*/}
						{/*	<View style={{flexDirection: 'row'}}>*/}
						{/*		<Button style={{flex: 1, marginRight: 5}} icon={'chevron-left'} mode="contained" color={'#eee'} onPress={() => this.stepBack()} disabled={this.state.step === 1} delayPressIn={0}>*/}
						{/*			{I18n.t('btn.back')}*/}
						{/*		</Button>*/}
						{/*		{this.state.step < 4 ? (*/}
						{/*			<Button style={{flex: 1, marginLeft: 5}} icon={'chevron-right'} mode="contained" onPress={() => this.stepNext()} disabled={this.canStepNext()} delayPressIn={0}>*/}
						{/*				{I18n.t('btn.next')}*/}
						{/*			</Button>*/}
						{/*		) : (*/}
						{/*			<Button style={{flex: 1, marginLeft: 5}} icon={'play'} mode="contained" onPress={() => this.startSession(this.state.newSession)} disabled={this.canStepBack()} delayPressIn={0}>*/}
						{/*				{I18n.t('btn.start')}*/}
						{/*			</Button>*/}
						{/*		)}*/}
						{/*	</View>*/}
						{/*</View>*/}
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
										{monthIdx === 0 && years.length > 0 && (<Text style={{color: THEME.primary}} h2>{year.year}</Text>)}
										<Text style={{color: THEME.primary, fontWeight: '200'}} h3>{month.month}</Text>
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
													{/*<TouchableOpacity onPress={() => {navigation.push('SessionsStats', { session })}} key={sessionIdx}>*/}
												{date.items.map((session, sessionIdx) => (
														<Card containerStyle={{marginBottom: sessionIdx < date.items.length - 1 ? -10 : 0}} key={sessionIdx}>
															<View style={{marginBottom: 5}}>
																<Text style={{fontWeight: 'bold'}}>{session.title}</Text>
															</View>
															<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
																<Text>{Time.duration(session.totalTime, false)}</Text>
																<Text style={styles.fromTo}>{session.startTime + ' - ' + session.endTime}</Text>
															</View>
															<View style={{flex: 1, flexDirection: 'row', marginHorizontal: -15, marginBottom: -15, marginTop: 15}}>
																<View style={{backgroundColor: THEME.success, height: 3, flex: session.statusPercentages.easy}} />
																<View style={{backgroundColor: THEME.warning, height: 3, flex: session.statusPercentages.unsure}} />
																<View style={{backgroundColor: THEME.error, height: 3, flex: session.statusPercentages.hard}} />
															</View>
														</Card>
												))}
													{/*</TouchableOpacity>*/}
											</View>
										</View>))}
								</View>))}
						</View>
					))}

					{this.state.mayHaveMore && <View style={{padding: 10}}>
						<Button mode="outline" onPress={() => this.handleLoadMore()} loading={this.state.loadingMore} disabled={this.state.loadingMore} delayPressIn={0}>
							{I18n.t('btn.loadMore')}
						</Button>
					</View>}
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
