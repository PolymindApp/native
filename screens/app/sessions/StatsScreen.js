import React from 'react'
import {View, ActivityIndicator} from 'react-native';
import { WebView } from 'react-native-webview';
import { THEME, SessionStatsService } from '@polymind/sdk-js';

export default class StatsScreen extends React.Component {

	state = {
		loading: true,
		stats: {},
	};

	componentDidMount() {
		const { session } = this.props.route.params;
		this.setState({ loading: true });
		SessionStatsService.getAllById(session.id).then(stats => {
			this.setState({ stats });
		}).finally(() => this.setState({ loading: false }));
	}

	//https://github.com/wuxudong/react-native-charts-wrapper
	getData() {
		const colors = {
			easy: THEME.primary,
			unsure: THEME.secondary,
			hard: THEME.third
		};
		const items = [];
		this.state.stats.items.forEach(item => {
			items.push({
				x: item.id,
				y: item.duration,
				z: item.showed_on,
				style: colors[item.tag] || '#666',
			});
		});

		console.log(items);

		return items;
	}

	render() {

		const { navigation } = this.props;
		const { session } = this.props.route.params;

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

		const data = this.getData();

		return (
			<View style={{flex: 1, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0, 0, 0, 0.075)'}}>
				<WebView
					originWhitelist={['*']}
					useWebKit={true}
					mediaPlaybackRequiresUserAction={false}
					allowsInlineMediaPlayback={true}
					domStorageEnabled={true}
					javaScriptEnabled={true}
					scrollEnabled={false}
					source={{ html: `
						  <script type="text/javascript" src="https://visjs.github.io/vis-graph3d/standalone/umd/vis-graph3d.min.js"></script>
						  <script type="text/javascript">

							let data = null;
							let graph = null;

							function onclick(point) {
							  console.log(point);
							}

							function drawVisualization() {

						  	  data = new vis.DataSet();

							  const json = '` + JSON.stringify(data) + `';
							  const stats = JSON.parse(json);

							  stats.forEach(stat => {
								data.add(stat);
							  });

							  var options = {
								width:  '100%',
								height: '100%',
								axisColor: '#eee',
								style: 'dot-color',
								showPerspective: true,
								showLegend: false,
								xCenter: '50%',
								yCenter: '50%',
								showGrid: true,
								keepAspectRatio: true,
								verticalRatio: 1,
								legendLabel: 'distance',
								cameraPosition: {
								  horizontal: 0.8,
								  vertical: 0,
								  distance: 1.4
								}
							  };

							  var container = document.getElementById('graph');
							  graph = new vis.Graph3d(container, data, options);
							  graph.on('click', onclick);
							}
						  </script>

						<body onload="drawVisualization()" style="background-color: #333">
							<div id="graph"></div>
						</body>
					` }}
				/>
			</View>
		);
	};
}
