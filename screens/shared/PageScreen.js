import React from 'react';
import {ScrollView} from "react-native-gesture-handler";
import {ActivityIndicator, View, Text} from "react-native";
import { PageService, THEME } from '@polymind/sdk-js';
import I18n from '../../locales/i18n';
import {WebView} from "react-native-webview";

export default class PageScreen extends React.Component {

	state = {
		page: null,
		loading: true,
	}

	componentDidMount() {
		this.load();
	}

	load() {
		const locale = I18n.locale.substring(0, 2);
		PageService.get(locale, this.props.route.params.slug).then(page => {
			this.setState({ page: page.getContent(locale), loading: false });
		});
	}

	render() {

		const { navigation } = this.props;
		const { params } = this.props.route

		if (this.state.loading) {
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
				</View>
			);
		}

		navigation.setOptions({
			title: this.state.page.title.length > 15 ? this.state.page.title.substring(0, 15) + '...' : this.state.page.title,
		});

		return (
			<WebView
				originWhitelist={['*']}
				useWebKit={true}
				scalesPageToFit={true}
				automaticallyAdjustContentInsets={true}
				source={{ html: `
					<html>
						<head>
							<base href="https://www.polymind.app">
							<link href='http://fonts.googleapis.com/css?family=Roboto:400,100,100italic,300,300italic,400italic,500,500italic,700,700italic,900italic,900' rel='stylesheet' type='text/css'>
							<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
							<style>
								body { font-family: 'Roboto', sans-serif; padding: 1rem; }
								p, li { color: rgba(0, 0, 0, 0.5) }
							</style>
						</head>
						<body style={{padding: '10px', backgroundColor: params.backgroundColor || '#eee'; margin: 0 }}>
							${this.state.page.content}
						</body>
					</html>
				` }}
			/>
		)
	}
}
