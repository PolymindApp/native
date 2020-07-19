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
							<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
						</head>
						<body style="padding: 10px; background-color: #eee; margin: 0;">
							${this.state.page.content}
						</body>
					</html>
				` }}
			/>
		)
	}
}
