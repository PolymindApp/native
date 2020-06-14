import * as React from 'react';
import {StyleSheet, View, RefreshControl, TouchableOpacity, ActivityIndicator, Dimensions} from 'react-native';
import {Card, Icon, Text, Divider, Input, ListItem} from 'react-native-elements';
import { Button } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import I18n from '../../../locales/i18n';
import PolymindSDK, { THEME, Time, SessionStatsService } from '@polymind/sdk-js';
import RBSheet from "react-native-raw-bottom-sheet";
import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/es';
import 'moment/locale/it';

const $polymind = new PolymindSDK();

export default class SessionsScreen extends React.Component {

	state = {
		refreshing: false,
		loading: true,
		drawerLoading: false,
		datasets: [],
		stats: {},
	}

	load() {
		const startDate = moment().subtract(1, 'month');
		const endDate = moment().add(1, 'day');

		return SessionStatsService.getAll('live', startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')).then(stats => {
			this.setState({ stats: stats.daily });
		});
	}

	componentDidMount() {
		this.setState({ loading: true });
		this.load().finally(() => this.setState({ loading: false }));
	}

	onRefresh() {
		this.setState({ refreshing: true });
		this.load().then(() => this.setState({ refreshing: false }));
	}

	startSession(dataset) {
		this.RBSheet.close();
		this.props.navigation.push('SessionsPlayer', { dataset })
	}

	openDrawer() {
		this.setState({ drawerLoading: true });
		$polymind.getDatasets().then(datasets => {
			this.setState({ datasets, drawerLoading: false });
			this.RBSheet.open();
		});
	}

	formattedSessions() {
		const dates = [];

		for (let [date, daily] of Object.entries(this.state.stats)) {
			const dateItem = {
				timestamp: moment(date).unix(),
				name: moment(date).format('ddd').toUpperCase().replace('.', ''),
				day: parseInt(moment(date).format('D')),
				year: parseInt(moment(date).format('YYYY')),
				month: moment(date).format('MMMM'),
				totalTags: daily.totalTags,
				totalTime: daily.totalTime,
				items: [],
			};
			dateItem.month = dateItem.month.substring(0, 1).toUpperCase() + dateItem.month.substring(1);

			for (let [sessionId, item] of Object.entries(daily.session)) {
				const item = daily.session[sessionId];
				item.timestamp = moment(item.start_date).unix();
				item.startTime = moment(item.start_date).format('HH:mm');
				item.endTime = moment(item.end_date).format('HH:mm');

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

		console.log(yearsMonths.length);

		return yearsMonths;
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

		return (
			<View style={{flex: 1}}>
				<RBSheet
					ref={ref => this.RBSheet = ref}
					height={Dimensions.get('window').height / 1.5}
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
									onPress={() => this.startSession(dataset)}
								/>
							))}
						</ScrollView>
					</View>
				</RBSheet>
				<ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'} refreshControl={
					<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh.bind(this)} />
				}>
					{years.length === 0 && (
						<View>
							<Text>Empty</Text>
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
												{date.items.map((session, sessionIdx) => (
													// <TouchableOpacity onPress={() => {navigation.push('SessionsStats', { session })}} key={sessionIdx}>
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
													// </TouchableOpacity>
												))}
											</View>
										</View>))}
								</View>))}
						</View>
					))}
				</ScrollView>
				<View style={{flex: 0, marginHorizontal: 10, marginBottom: 10}}>
					<Divider style={{marginBottom: 10}} />
					<Button mode="contained" onPress={() => this.openDrawer()} loading={this.state.drawerLoading} delayPressIn={0}>
						{I18n.t('btn.start')}
					</Button>
				</View>
			</View>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 0,
	},
	dateItem: {
		flex: 1,
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
