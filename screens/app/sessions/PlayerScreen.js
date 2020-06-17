import React from 'react';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import {ActivityIndicator, StyleSheet, StatusBar, TouchableOpacity, View, Share} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PolymindSDK, { THEME, SessionStructureService, ComponentService, Component } from '@polymind/sdk-js';
import {Text} from "react-native-elements";
import I18n from "../../../locales/i18n";
import { WebView } from 'react-native-webview';

const $polymind = new PolymindSDK();

export default class StatsScreen extends React.Component {

	state = {
		generating: false,
		structure: null,
		session: null,
		iframeLoaded: false,
		playerUrl: null,
	};

	componentDidMount() {
		const { settings } = this.props.route.params;
		this.setState({ generating: true });
		ComponentService.getAll().then(components => {

			const component = new Component(components.data[0]);
			const parameters = component.getDefaultParameters(settings.dataset);
			Object.assign(parameters, settings.params);

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
					style: {
						borderTopWidth: 0,
					}
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

	render() {

		const { navigation } = this.props;
		const { settings } = this.props.route.params;

		navigation.setOptions({
			title: settings.dataset.name,
			headerRight: () => (
				<View style={{marginRight: 10}}>
					<TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => this.share()}>
						<Text style={{color: 'white'}}>{I18n.t('btn.share')}</Text>
					</TouchableOpacity>
				</View>
			)
		});

		return (
			<View style={{flex: 1}}>
				{this.state.generating && (<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
					<Text style={{marginTop: 10, color: THEME.primary}}>{I18n.t('state.generating')}</Text>
				</View>)}
				{this.state.playerUrl && <WebView
					originWhitelist={['*']}
					useWebKit={true}
					mediaPlaybackRequiresUserAction={false}
					allowsInlineMediaPlayback={true}
					domStorageEnabled={true}
					javaScriptEnabled={true}
					scrollEnabled={false}
					startInLoadingState={!this.state.generating}
					renderLoading={() => (
						<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
							<ActivityIndicator size="large" color={THEME.primary} />
							<Text style={{marginTop: 10, color: THEME.primary}}>{I18n.t('state.generating')}</Text>
						</View>
					)}
					source={{ uri: this.state.playerUrl }}
				/>}
			</View>
		);
	};
}

const styles = StyleSheet.create({

});
