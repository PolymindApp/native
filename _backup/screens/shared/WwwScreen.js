import React from 'react';
import {ActivityIndicator, View, Text} from "react-native";
import PolymindSDK, { THEME } from '@polymind/sdk-js';
import I18n from '../../locales/i18n';
import {WebView} from "react-native-webview";

const $polymind = new PolymindSDK();

export default class WwwScreen extends React.Component {

	render() {

		const { params } = this.props.route;
		const locale = I18n.locale.substring(0, 2);
		const uri = $polymind.getEnvVar('WWW_URL') + params.path + '?layout=0&locale=' + locale;

		return (
				<View style={{flex: 1, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0, 0, 0, 0.075)'}}>
				<WebView
					originWhitelist={['*']}
					useWebKit={true}
					mediaPlaybackRequiresUserAction={false}
					allowsInlineMediaPlayback={true}
					domStorageEnabled={true}
					javaScriptEnabled={true}
					startInLoadingState={true}
					renderLoading={() => <View style={{flex: 1000, alignItems: 'center', justifyContent: 'center'}}>
						<ActivityIndicator size={'large'} color={THEME.primary} />
						<Text style={{marginTop: 10, color: THEME.primary}}>{I18n.t('state.loading')}</Text>
					</View>}
					source={{ uri }}
				/>
			</View>
		)
	}
}
