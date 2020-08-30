import React from 'react'
import {View, ScrollView, ActivityIndicator, Platform, FlatList, TouchableOpacity, Alert} from 'react-native';
import { WebView } from 'react-native-webview';
import { THEME, SessionStatsService, Time, SessionService } from '@polymind/sdk-js';
import {ListItem, Text} from "react-native-elements";
import {Icon} from 'react-native-elements';
import moment from 'moment';
import I18n from "../../../locales/i18n";
import {List} from "react-native-paper";
import ContextualOptions from "../../../components/ContextualOptions";

const graphHTML = require('./Stats.html');

export default class StatsScreen extends React.Component {

	optionItems = [
		{ name: I18n.t('btn.cancel'), callback: () => {}, cancel: true, android: false },
		{ icon: 'archive', name: I18n.t('btn.archive'), callback: () => {
			const { route, navigation } = this.props;
			Alert.alert(I18n.t('alert.archiveSessionTitle'), I18n.t('alert.archiveSessionDesc'), [
				{ text: I18n.t('btn.archive'), onPress: () => {
					this.setState({ archiving: true });
					this.archive().then(() => navigation.pop());
				}, style: 'destructive' },
				{ text: I18n.t('btn.cancel'), style: "cancel" }
			], { cancelable: false });
		}, destructive: true },
	];

	webview = null;

	state = {
		loading: true,
		archiving: false,
		min: null,
		max: null,
		data: [],
		stats: [],
		easy: true,
		unsure: true,
		hard: true,
		viewed: true,
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

	archive() {
		const { session } = this.props.route.params;
		return SessionService.archive(session.id);
	}

	initGraph(data) {

		const xMin = data.reduce((prev, curr) => {
			if (curr.x === 0) {return prev;}
			return prev.x < curr.x ? prev : curr;
		}, 0).x;
		const xMax = data.reduce((prev, curr) => {
			if (curr.x === 0) {return prev;}
			return prev.x > curr.x ? prev : curr;
		}, 0).x;
		const yMin = data.reduce((prev, curr) => {
			if (curr.y === 0) {return prev;}
			return prev.y < curr.y ? prev : curr;
		}, 0).y;
		let yMax = data.reduce((prev, curr) => {
			if (curr.y === 0) {return prev;}
			return prev.y > curr.y ? prev : curr;
		}, 0).y;

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
				try {
					let json = '` + JSON.stringify(params).replace(/[\/\(\)\']/g, "\\$&") + `';
					let data = JSON.parse(json);
					init(data, ` + (Platform.OS === 'android') + `);
				} catch(e) {
					alert('` + I18n.t('error.unknownDesc') + `');
				}
			})();
		`);
	}

	handleScroll(event) {
		console.log(event);
	}

	//https://github.com/wuxudong/react-native-charts-wrapper
	getData(stats, min = null, max = null, filter = () => true) {

		const groups = ['easy', 'unsure', 'hard', 'viewed', 'mode'];
		const items = [];
		const modes = [];
		stats.items.filter(item => {
			return (min === null || item.showed_on >= min)
				&& (max === null || item.showed_on <= max);
		}).filter(filter).forEach(item => {

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

	toggleTag(tag) {
		const state = this.state;
		state[tag] = !state[tag];
		this.setState(state);

		const data = this.getData(this.state.stats, this.state.min, this.state.max).filter(item => {
			return this.state[item.data.tag];
		});
		this.initGraph(data);
	}

	render() {

		const { navigation } = this.props;
		const { session } = this.props.route.params;
		const startDate = moment(session.start_date).format('YYYY-MM-DD');

		navigation.setOptions({
			title: session.title,
			headerRight: () => (
				<View style={{marginRight: 10, flexDirection: 'row'}}>
					<ContextualOptions items={this.optionItems} />
				</View>
			),
		});

		if (this.state.loading || this.state.archiving) {
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
				</View>
			);
		}

		const data = this.getData(this.state.stats, this.state.min, this.state.max).filter(item => {
			return this.state[item.data.tag];
		});

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
					) : (
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
					)}
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
				<View style={{ flex: 0, flexDirection: 'row', alignItems: 'stretch' }}>
					<TouchableOpacity style={{flex: 0.25}} onPress={() => this.toggleTag('easy')}>
						<Text lineBreakMode={'tail'} numberOfLines={1} style={{ textAlign: 'center', backgroundColor: this.state['easy'] ? THEME.tags.easy.color : '#eee', color: this.state['easy'] ? 'white' : THEME.tags['easy'].color, padding: 5, }}>{I18n.t('tags.easy')}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={{flex: 0.25}} onPress={() => this.toggleTag('unsure')}>
						<Text lineBreakMode={'tail'} numberOfLines={1} style={{ textAlign: 'center', backgroundColor: this.state['unsure'] ? THEME.tags.unsure.color : '#eee', color: this.state['unsure'] ? 'white' : THEME.tags['unsure'].color, padding: 5, }}>{I18n.t('tags.unsure')}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={{flex: 0.25}} onPress={() => this.toggleTag('hard')}>
						<Text lineBreakMode={'tail'} numberOfLines={1} style={{ textAlign: 'center', backgroundColor: this.state['hard'] ? THEME.tags.hard.color : '#eee', color: this.state['hard'] ? 'white' : THEME.tags['hard'].color, padding: 5, }}>{I18n.t('tags.hard')}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={{flex: 0.25}} onPress={() => this.toggleTag('viewed')}>
						<Text lineBreakMode={'tail'} numberOfLines={1} style={{ textAlign: 'center', backgroundColor: this.state['viewed'] ? THEME.tags.viewed.color : '#eee', color: this.state['viewed'] ? 'white' : THEME.tags['viewed'].color, padding: 5, }}>{I18n.t('tags.viewed')}</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};
}
