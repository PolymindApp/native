import React from 'react';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import {ActivityIndicator, StyleSheet, StatusBar, TouchableOpacity, View, Share, Alert} from 'react-native';
import PolymindSDK, { THEME, SessionStructureService, ComponentService, Component, UserService } from '@polymind/sdk-js';
import {Text} from "react-native-elements";
import I18n from "../../../locales/i18n";
import { WebView } from 'react-native-webview';
import { HeaderBackButton } from '@react-navigation/stack';

const $polymind = new PolymindSDK();

export default class StatsScreen extends React.Component {

	state = {
		generating: false,
		structure: null,
		session: null,
		iframeLoaded: false,
		playerUrl: null,
	};

	webview = null;

	componentDidMount() {

		const { navigation } = this.props;
		const { settings } = this.props.route.params;

		this.setState({ generating: true });
		Promise.all([
			ComponentService.getAll(),
			// $polymind.me(),
		]).then(([components, user]) => {

			const component = new Component(components.data[0]);
			const parameters = component.getDefaultParameters(settings.dataset);
			Object.assign(parameters, settings.params, {
				// general: {
				// 	dark: user.settings.theme === 'dark',
				// }
			});

			return SessionStructureService.generate({
				dataset: settings.dataset.id,
				component: component.id,
				parameters,
			})
				.then(session => {
					const playerUrl = $polymind.playerUrl + '/d/' + session.hash + '/live?native=1&locale=' + I18n.locale.substring(0, 2);
					console.log(playerUrl);
					this.setState({ session, playerUrl, generating: false });
				});
		}).finally(() => this.setState({ generating: false }));

		ScreenOrientation.unlockAsync();
		const subscription = ScreenOrientation.addOrientationChangeListener(info => {
			this.adjustScreenOrientation(info.orientationInfo.orientation);
		});

		activateKeepAwake();

		navigation.setOptions({
			title: settings.dataset.name,
			headerLeft: (props) => (
				<HeaderBackButton
					{...props}
					onPress={() => {
						Alert.alert(I18n.t('alert.backSessionTitle'), I18n.t('alert.backSessionDesc'), [
							{ text: I18n.t('btn.terminate'), onPress: () => {
								this.sendMessage('terminate_and_back');
							}, style: 'destructive' },
							{ text: I18n.t('btn.cancel'), style: "cancel" }
						], { cancelable: false });
					}}
				/>
			),
			headerRight: () => (
				<View style={{marginRight: 10}}>
					<TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => this.share()} hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}>
						<Text style={{color: 'white'}}>{I18n.t('btn.share')}</Text>
					</TouchableOpacity>
				</View>
			)
		});
	}

	componentWillUnmount() {
		StatusBar.setHidden(false, 'slide');
		ScreenOrientation.removeOrientationChangeListeners();
		ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

		deactivateKeepAwake();
	}

	adjustScreenOrientation(orientation) {

		const { navigation } = this.props;

		switch (orientation) {
			case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
			case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
				navigation.setOptions({
					headerShown: false,
				});
				navigation.dangerouslyGetParent().setOptions({
					tabBarVisible: false,
				});
				break;
			case ScreenOrientation.Orientation.PORTRAIT_UP:
			case ScreenOrientation.Orientation.PORTRAIT_DOWN:
				navigation.setOptions({
					headerShown: true,
				});
				navigation.dangerouslyGetParent().setOptions({
					tabBarVisible: true,

					style: {
						borderTopWidth: 0,
					}
				});
				break;
		}
	}

	async share() {

		const { settings } = this.props.route.params;
		try {
			const result = await Share.share({
				message: settings.dataset.name,
				url: this.state.playerUrl,
			}, {
				tintColor: THEME.primary
			});

			if (result.action === Share.sharedAction) {
				if (result.activityType) {
					// shared with activity type of result.activityType
				} else {
					// shared
				}
			} else if (result.action === Share.dismissedAction) {
				// dismissed
			}
		} catch (error) {

		}
	};

	handleMessage(event) {

		const { navigation } = this.props;
		const { type, data } = JSON.parse(event.nativeEvent.data);

		switch (type) {
			case 'back':
				navigation.pop();
				break;
		}
	}

	sendMessage(type, data) {
		this.webview.injectJavaScript(`(function() {
			window.postMessage(JSON.stringify({
				type: '${type}',
				` + (data ? `data: '${JSON.stringify(data)}',` : '') + `
			}), location.origin);
		})()`);
	}

	render() {
		return (
			<View style={{flex: 1}}>
				<WebView
					ref={webview => this.webview = webview}
					originWhitelist={['*']}
					useWebKit={true}
					mediaPlaybackRequiresUserAction={false}
					allowsInlineMediaPlayback={true}
					domStorageEnabled={true}
					javaScriptEnabled={true}
					scrollEnabled={false}
					onMessage={event => this.handleMessage(event)}
					startInLoadingState={!this.state.generating}
					style={!this.state.playerUrl ? { flex: 0, height: 0, opacity: 0, backgroundColor: 'black' } : {}}
					source={this.state.playerUrl ? { uri: this.state.playerUrl } : null }
					renderLoading={() => (
						<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
							<ActivityIndicator size="large" color={THEME.primary} />
							<Text style={{marginTop: 10, color: THEME.primary}}>{I18n.t('state.generating')}</Text>
						</View>
					)}
				/>
			</View>
		);
	};
}

const styles = StyleSheet.create({

});
