import React from 'react';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import {ActivityIndicator, StyleSheet, StatusBar, TouchableOpacity, View, Share, Alert} from 'react-native';
import PolymindSDK, { THEME, SessionStructureService, ComponentService, Component, Locale } from '@polymind/sdk-js';
import {Text} from "react-native-elements";
import I18n from "../../../locales/i18n";
import { WebView } from 'react-native-webview';
import { HeaderBackButton } from '@react-navigation/stack';
import {Audio} from "expo-av";
import Offline from '../../../utils/Offline';

let sounds = [];
let voices = [];
let lastVoice = null;

const meditationSongs = [
	'https://polymind.s3.ca-central-1.amazonaws.com/player/mental-energizer.mp3'
];
let playbackMeditation;

// https://github.com/expo/expo/blob/master/docs/pages/versions/unversioned/sdk/audio.md#arguments-1
Audio.setAudioModeAsync({
	staysActiveInBackground: true,
	playsInSilentModeIOS: true,
	interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
	interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
	shouldDuckAndroid: true,
	playThroughEarpieceAndroid: false,
});

const $polymind = new PolymindSDK();
let terminateBackTimeout;

export default class StatsScreen extends React.Component {

	state = {
		generating: false,
		structure: null,
		session: null,
		iframeLoaded: false,
		playerUrl: null,
		loaded: false,
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
					const playerUrl = $polymind.playerUrl + '/d/' + session.hash + '/live?native=1&platform=' + Platform.OS + '&locale=' + I18n.locale.substring(0, 2) + '&autoplay=1';
					console.log(playerUrl);
					this.setState({ session, playerUrl, generating: false });
				});
		}).finally(() => this.setState({ generating: false }));

		ScreenOrientation.unlockAsync();
		const subscription = ScreenOrientation.addOrientationChangeListener(info => {
			this.adjustScreenOrientation(info.orientationInfo.orientation);
		});

		activateKeepAwake();
		this._navigationFocus = navigation.addListener('focus', () => {
			activateKeepAwake();
		});
		this._navigationBlur = navigation.addListener('blur', () => {
			deactivateKeepAwake();
		});

		navigation.setOptions({
			title: settings.dataset.name,
			headerLeft: (props) => (
				<HeaderBackButton
					{...props}
					onPress={() => {
						Alert.alert(I18n.t('alert.backSessionTitle'), I18n.t('alert.backSessionDesc'), [
							{ text: I18n.t('btn.terminate'), onPress: () => {
								const { navigation } = this.props;
								this.sendMessage('terminate_and_back');
								clearTimeout(terminateBackTimeout);
								terminateBackTimeout = setTimeout(() => {
									navigation.navigate('Sessions');
									this.stopSounds();
								}, !this.state.loaded ? 0 : 5000);
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
		this._navigationFocus();
		this._navigationBlur();
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

	async handleMessage(event) {
		const { navigation } = this.props;
		const { type, data } = JSON.parse(event.nativeEvent.data);

		switch (type) {
			case 'read':
				const readCallback = async () => {

					const locale = Locale.abbrToLocale(data.settings.lang);
					const text = data.text.toLowerCase().replace(/\s{2,}/g, ' ');
					const key = locale + '_' + text;

					if (voices[key]) {
						try {
							const playbackObject = await Audio.Sound.createAsync(
								{ uri: voices[key].file_uri },
								{ shouldPlay: true }
							);
							lastVoice = playbackObject;
						} catch (e) {
							switch (e.code) {
								case 'ABI37_0_0EXAV': // Corrupted memory.. try to recreate and read from remote URL meanwhile..
									const playbackObject = await Audio.Sound.createAsync(
										{ uri: voices[key].file_url },
										{ shouldPlay: true }
									);
									voices[key] = await Offline.cacheVoice(voices[key], true);
									lastVoice = playbackObject;
									console.log('read from remote url', voices[key]);
									break;
								default:
									console.error(e.code);
									break;
							}
						}

					}
				};

				if (lastVoice !== null && lastVoice.pauseAsync) {
					lastVoice.pauseAsync().then(readCallback);
				} else {
					await readCallback();
				}

				break;
			case 'play_sound':
				const playbackObject = await Audio.Sound.createAsync(
					{ uri: sounds[data] },
					{ shouldPlay: true }
				);
				break;
			case 'meditating':

				if (playbackMeditation) {
					await playbackMeditation.pauseAsync();
				}

				if (data) {
					if (!playbackMeditation) {
						const { sound: soundObject, status } = await Audio.Sound.createAsync(
							{ uri: meditationSongs[0] },
							{ shouldPlay: true, volume: 0.5, isLooping: true }
						);
						playbackMeditation = soundObject;
					} else {
						await playbackMeditation.playAsync();
					}
				}

				this.sendMessage('meditating', data);
				break;
			case 'all_voices':
				voices = await Offline.cacheVoices(data);
				break;
			case 'all_sounds':
				sounds = await Offline.cacheSounds(data);
				break;
			case 'ready':
				this.setState({ loaded: true });
				break;
			case 'back':
				clearTimeout(terminateBackTimeout);
				navigation.navigate('Sessions', { refresh: true });
				this.stopSounds();
				break;
		}
	}

	stopSounds() {
		if (playbackMeditation) {
			playbackMeditation.stopAsync();
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
				{!this.state.loaded && <View style={{flex: 1000, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size={'large'} color={THEME.primary} />
					<Text style={{marginTop: 10, color: THEME.primary}}>{I18n.t('state.loading')}</Text>
				</View>}
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
					style={!this.state.loaded ? { flex: 0, height: 0, opacity: 0, backgroundColor: 'black' } : {}}
					source={this.state.playerUrl ? { uri: this.state.playerUrl } : null }
				/>
			</View>
		);
	};
}

const styles = StyleSheet.create({

});
