import React from 'react'
import {
	View,
	ActivityIndicator,
	Platform,
	Modal,
	StyleSheet,
	Text,
	Dimensions,
	Image,
	TouchableOpacity
} from 'react-native';
import { WebView } from 'react-native-webview';
import { IconButton } from 'react-native-paper';
import { THEME } from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';
import Carousel from "react-native-snap-carousel";

const graphHTML = require('./graph.html');

export default class StatsScreen extends React.Component {

	webview = null;

	state = {
		loading: true,
		detailsModalVisible: true,
		activeIdx: 0,
		nodes: [
			{id: 1, count: 80, completed: 44, label: 'Animals', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/1.png'},
			{id: 2, count: 80, completed: 44, label: 'Basic Verbs', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/2.png'},
			{id: 3, count: 80, completed: 44, label: 'Kitchen', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/3.png'},
			{id: 4, count: 80, completed: 44, label: 'this is a test', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/4.png',},
			{id: 5, count: 80, completed: 44, label: 'this is a test', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/5.png'},
			{id: 6, count: 80, completed: 44, label: 'this is a test', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/6.png'},
			{id: 7, count: 80, completed: 44, label: 'this is a test', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/7.png'},
			{id: 8, count: 80, completed: 44, label: 'this is a test', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/8.png'},
			{id: 9, count: 80, completed: 44, label: 'this is a test', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/9.png'},
			{id: 10, count: 66, completed: 55, label: 'this is a test', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/10.png'},
			{id: 11, count: 66, completed: 55, label: 'this is a test', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/11.png'},
			{id: 12, count: 66, completed: 55, label: 'this is a test', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/12.png'},
			{id: 13, count: 66, completed: 55, label: 'this is a test', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/13.png'},
			{id: 14, count: 66, completed: 55, label: 'this is a test', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/14.png'},
			{id: 16, count: 66, completed: 55, label: 'this is a test', shape: 'circularImage', image: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/anotherMissing.png', brokenImage: 'https://visjs.github.io/vis-network/examples/network/img/indonesia/9.png'}
		],
		edges: [
			{from: 1, to: 2},
			{from: 2, to: 3},
			{from: 2, to: 4},
			{from: 4, to: 5},
			{from: 4, to: 6},
			{from: 6, to: 7},
			{from: 7, to: 8},
			{from: 8, to: 9},
			{from: 8, to: 10},
			{from: 10, to: 11},
			{from: 11, to: 12},
			{from: 12, to: 13},
			{from: 13, to: 14},
			{from: 9, to: 16}
		],
	};

	componentDidMount() {
		this.setState({ loading: false });

		setTimeout(() => {
			const data = this.getData();
			this.initGraph(data, 1);
		}, 1000);
	}

	getData() {
		return {
			nodes: this.state.nodes,
			edges: this.state.edges,
		};
	}

	initGraph(data, focusOn) {
		this.webview.injectJavaScript(`
			(function() {
				let json = '` + JSON.stringify(data) + `';
				let data = JSON.parse(json);
				init(data, ` + Platform.isAndroid + `, ` + focusOn + `);
			})();
		`);
	}

	focusOn(idx) {
		this.webview.injectJavaScript(`
			(function() {
				focusOn(` + this.state.nodes[idx].id + `);
			})();
		`);
	}

	async handleMessage(event) {

		const {type, data} = JSON.parse(event.nativeEvent.data);

		switch (type) {
			case 'click':
				if (data.nodes.length > 0) {
					const idx = this.state.nodes.findIndex(node => data.nodes.indexOf(node.id) !== -1);
					this._carousel.snapToItem(idx, true);
					this.setState({ detailsModalVisible: true });
				}
				break;
		}
	}

	startSession(node) {
		this.setState({ detailsModalVisible: false });
	}

	render() {

		const { navigation } = this.props;

		navigation.setOptions({
			// headerLeft: () => (
			// 	<TouchableOpacity style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 10 }} onPress={() => navigation.push('ProfilePage', { slug: 'help-dictionary' })} hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}>
			// 		<Text style={{color: 'white'}}>{I18n.t('btn.help')}</Text>
			// 	</TouchableOpacity>
			// ),
			headerRight: () => (
				<TouchableOpacity style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingRight: 10 }} hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}>
					<Text style={{color: 'white'}}>{I18n.t('btn.filters')}</Text>
				</TouchableOpacity>
			),
		});

		if (this.state.loading) {
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
				</View>
			);
		}

		return (
			<View style={{flex: 1, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0, 0, 0, 0.075)'}}>
				<View style={styles.carousel}>
					<Carousel
						ref={(c) => { this._carousel = c; }}
						data={this.state.nodes}
						renderItem={({item, index}) => (
							<View style={styles.card}>
								<Image source={{ uri: item.image }} style={{ flex: 0, width: 60, height: 60, borderRadius: 10, }} />
								<View style={{marginHorizontal: 15, flex: 1}}>
									<Text style={{fontWeight: '600'}}>{item.label}</Text>
									<Text>{item.completed} / {item.count}</Text>
								</View>
								<IconButton style={{flex: 0}} icon={'unfold-more-horizontal'} color={THEME.primary} size={32} onPress={() => {
									this.startSession(item);
								}}>
									Start Session
								</IconButton>
							</View>
						)}
						onSnapToItem={(index) => {
							this.focusOn(index);
							this.setState({ activeIdx: index });
						}}
						sliderWidth={Dimensions.get('window').width}
						itemWidth={Dimensions.get('window').width - 60}
					/>
				</View>

				<WebView
					ref={webview => this.webview = webview}
					originWhitelist={['*']}
					useWebKit={true}
					onMessage={event => this.handleMessage(event)}
					mediaPlaybackRequiresUserAction={false}
					allowsInlineMediaPlayback={true}
					domStorageEnabled={true}
					javaScriptEnabled={true}
					scrollEnabled={false}
					source={graphHTML}
				/>
			</View>
		);
	};
}

const styles = StyleSheet.create({
	carousel: {
		position: 'absolute',
		zIndex: 1,
		flex: 1,
		bottom: 0,
	},
	card: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 10,
		alignItems: 'center',
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		marginVertical: 15,
	},
});
