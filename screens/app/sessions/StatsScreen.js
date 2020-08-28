import React from 'react'
import {View, ScrollView, ActivityIndicator, Platform, FlatList} from 'react-native';
import { WebView } from 'react-native-webview';
import { THEME, SessionStatsService, Time } from '@polymind/sdk-js';
import {ListItem, Text} from "react-native-elements";
import {Icon} from 'react-native-elements';
import moment from 'moment';
import I18n from "../../../locales/i18n";
import {List} from "react-native-paper";

const graphHTML = require('./Stats.html');

export default class StatsScreen extends React.Component {

	webview = null;

	state = {
		loading: true,
		min: null,
		max: null,
		data: [],
		stats: [],
	};

	componentDidMount() {
		const { session } = this.props.route.params;
		this.setState({ loading: true });
		SessionStatsService.getAllById(session.id).then(stats => {
			const data = this.getData(stats);
			this.setState({ data, stats });
		}).finally(data => this.setState({ loading: false }));
	}

	async handleMessage(event) {

		const {type, data} = JSON.parse(event.nativeEvent.data);

		switch (type) {
			case 'rangeChanged':
				this.setState({
					min: moment(data.start).unix(),
					max: moment(data.end).unix()
				});
				break;
		}
	}

	initGraph(data) {

		const xMin = data.reduce((prev, curr) => {
			if (curr.x === 0) {return prev;}
			return prev.x < curr.x ? prev : curr;
		}).x;
		const xMax = data.reduce((prev, curr) => {
			if (curr.x === 0) {return prev;}
			return prev.x > curr.x ? prev : curr;
		}).x;
		const yMin = data.reduce((prev, curr) => {
			if (curr.y === 0) {return prev;}
			return prev.y < curr.y ? prev : curr;
		}).y;
		let yMax = data.reduce((prev, curr) => {
			if (curr.y === 0) {return prev;}
			return prev.y > curr.y ? prev : curr;
		}).y;

		if (yMax > 50) {
			yMax = 50;
		}

		const params = {
			data,
			xMin,
			xMax,
			yMin,
			yMax,
		};

		this.webview.injectJavaScript(`
			(function() {
				let json = '` + JSON.stringify(params) + `';
				let data = JSON.parse(json);
				init(data, ` + (Platform.OS === 'android') + `);
			})();
		`);
	}

	handleScroll(event) {
		console.log(event);
	}

	//https://github.com/wuxudong/react-native-charts-wrapper
	getData(stats, min = null, max = null) {

		const groups = ['easy', 'unsure', 'hard', 'viewed'];
		const items = [];
		stats.items.filter(item => {
			return (min === null || item.showed_on >= min)
				&& (max === null || item.showed_on <= max);
		}).forEach(item => {
			const index = groups.indexOf(item.tag);
			items.push({
				x: item.showed_on * 1000,
				y: item.duration,
				group: index === -1 ? 3 : index,
				formattedTime: moment(item.showed_on * 1000).format('HH:mm:ss'),
				data: item,
			});
		});

		return items;
	}

	render() {

		const { navigation } = this.props;
		const { session } = this.props.route.params;
		const startDate = moment(session.start_date).format('YYYY-MM-DD');

		navigation.setOptions({
			title: session.title
		});

		if (this.state.loading) {
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
				</View>
			);
		}

		const data = this.getData(this.state.stats, this.state.min, this.state.max);

		return (
			<View style={{flex: 1, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0, 0, 0, 0.075)'}}>
				<List.Subheader>
					{I18n.t('session.stats.title', { count: session.totalCount, date: startDate })}
				</List.Subheader>
				<View style={{flex: 2}}>
					{data.length === 0 ? (
						<View style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10}}>
							<Icon name={'file-question'} size={64} style={{opacity: 0.3}}></Icon>
							<Text style={{textAlign: 'center'}} h3>{I18n.t('session.stats.noFilteredItemTitle')}</Text>
							<Text style={{textAlign: 'center'}} h5>{I18n.t('session.stats.noFilteredItemDesc')}</Text>
						</View>
					) : null}
					<FlatList
						data={data}
						renderItem={({ item, index }) => <ListItem
							title={item.data.text}
							subtitle={item.formattedTime}
							subtitleStyle={{opacity: 0.33}}
							leftIcon={() => (
								<Icon name={'circle'} color={THEME.tags[item.data.tag].color} />
							)}
							rightElement={() => (
								<Text>{Time.duration(item.data.duration, false)}</Text>
							)}
							topDivider={index > 0}
						/>}
						keyExtractor={item => item.x + item.y}
					/>
				</View>
				<WebView
					ref={webview => this.webview = webview}
					style={{flex: 1}}
					originWhitelist={['*']}
					useWebKit={true}
					mediaPlaybackRequiresUserAction={false}
					onMessage={event => this.handleMessage(event)}
					allowsInlineMediaPlayback={true}
					onLoadEnd={() => this.initGraph(this.state.data)}
					domStorageEnabled={true}
					javaScriptEnabled={true}
					scrollEnabled={false}
					startInLoadingState={true}
					renderLoading={() => <View style={{flex: 1000, alignItems: 'center', justifyContent: 'center'}}>
						<ActivityIndicator size={'large'} color={THEME.primary} />
						<Text style={{marginTop: 10, color: THEME.primary}}>{I18n.t('state.loading')}</Text>
					</View>}
					source={graphHTML}
				/>
			</View>
		);
	};
}
