import React from 'react';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import {AppState, ActivityIndicator, StyleSheet, StatusBar, TouchableOpacity, View, Share, Alert} from 'react-native';
import PolymindSDK, { File, THEME, SessionStructureService, ComponentService, Component, Locale } from '@polymind/sdk-js';
import {Text} from "react-native-elements";
import I18n from "../../../locales/i18n";
import { WebView } from 'react-native-webview';
import { HeaderBackButton } from '@react-navigation/stack';
import {Audio} from "expo-av";
import Offline from '../../../utils/Offline';
import Sound from '../../../utils/Sound';

const memory = {
	sounds: {},
	voices: [],
	mergedVoices: '',
};
const meditationSongs = [
	'https://polymind.s3.ca-central-1.amazonaws.com/player/mental-energizer.mp3'
];
let playbackVoice;
let playbackMeditation;
let keepMergedVoicesAudioSessionAliveInterval;
let mergedVoiceSound;

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
		appState: AppState.currentState,
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
			this.sendMessage('native_play');
		});
		this._navigationBlur = navigation.addListener('blur', () => {
			deactivateKeepAwake();
			this.sendMessage('native_pause');
		});

		navigation.setOptions({
			title: settings.dataset.name,
			headerLeft: (props) => (
				<HeaderBackButton
					{...props}
					onPress={() => {
						Alert.alert(I18n.t('alert.backSessionTitle'), I18n.t('alert.backSessionDesc'), [
							{ text: I18n.t('btn.terminate'), onPress: () => {
								this.sendMessage('terminate_and_back');
								clearTimeout(terminateBackTimeout);
								terminateBackTimeout = setTimeout(() => {
									this.goBack();
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

		AppState.addEventListener('change', this.handleAppStateChange);
	}

	componentWillUnmount() {
		StatusBar.setHidden(false, 'slide');
		ScreenOrientation.removeOrientationChangeListeners();
		ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

		deactivateKeepAwake();
		this._navigationFocus();
		this._navigationBlur();

		AppState.removeEventListener('change', this.handleAppStateChange);
	}

	handleAppStateChange = nextAppState => {

		if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
			console.log('Foreground');
			// this.toggleKeepMergedVoicesAudioSessionAlive(true);
		} else if (nextAppState !== 'active') {
			console.log('Background');
			// this.toggleKeepMergedVoicesAudioSessionAlive(false);
		}

		this.setState({ appState: nextAppState });
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
			case 'index':
				console.log('index', data);
				break;
			case 'read':
				const locale = Locale.abbrToLocale(data.settings.lang);
				const text = data.text.toLowerCase().replace(/\s{2,}/g, ' ');
				const voice = memory.voices.find(voice => voice.locale === locale && voice.text === text);

				if (playbackVoice && !playbackVoice.completed) {
					await playbackVoice.sound.stopAsync().catch(err => console.log(err));
					await playbackVoice.sound.unloadAsync().catch(err => console.log(err));
				}

				if (voice) {
					playbackVoice = await Sound.play(voice.file_name, voice.file_url, 'voice');
				}
				break;
			case 'play_sound':
				await Sound.play(data + '.mp3', memory.sounds[data], 'sound');
				break;
			case 'meditating':

				if (playbackMeditation) {
					await playbackMeditation.pauseAsync().catch(err => console.log(err, meditationSongs[0]));
				}

				if (data) {
					if (!playbackMeditation) {
						const { sound: soundObject, status } = await Audio.Sound.createAsync(
							{ uri: meditationSongs[0] },
							{ shouldPlay: true, volume: 0.5, isLooping: true }
						).catch(err => console.log(err, meditationSongs[0]));
						playbackMeditation = soundObject;
					} else {
						await playbackMeditation.playAsync().catch(err => console.log(err, meditationSongs[0]));
					}
				}

				this.sendMessage('meditating', data);
				break;
			case 'all_voices':
				memory.voices = data;
				await Offline.cacheFiles(data.map(item => ({
					name: item.file_name,
					url: item.file_url,
				})));
				// await this.mergeVoices();
				break;
			case 'all_sounds':
				memory.sounds = data;
				const keys = Object.keys(data);
				await Offline.cacheFiles(keys.map((key, keyIdx) => ({
					name: keys[keyIdx] + '.mp3', // Needs extension otherwise ends up corrupted..
					url: data[key],
				})));
				break;
			case 'ready':
				this.setState({ loaded: true });
				break;
			case 'back':
				clearTimeout(terminateBackTimeout);
				this.goBack();
				break;
		}
	}

	goBack() {

		const { navigation } = this.props;

		global.mustRefreshSession = true;
		navigation.navigate('Sessions');

		this.adjustScreenOrientation(ScreenOrientation.Orientation.PORTRAIT_UP);

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

	// TODO: voice longer than speed? (surely will break stuff..)
	// TODO: might make the app crash once builded..
	async mergeVoices() {

		const { params } = this.props.route.params.settings;

		let content = Sound.generateBase64Silence(2000);
		const keys = Object.keys(memory.voices);
		for (let i = 0; i < memory.voices.length; i++) {
			const voice = memory.voices[i];
			content += await Offline.getContent(voice.file_name);

			const audio = await Sound.getAudio(voice.file_name);
			const duration = audio.playback.durationMillis;
			await audio.sound.unloadAsync();

			let timeLeft = (params.component.speed * 1000) - duration;
			if (timeLeft > 0) {
				const silence = Sound.generateBase64Silence(timeLeft);
				content += silence;
			}
		}

		memory.mergedVoices = content;
		const sound = await Sound.fromBase64('merged', memory.mergedVoices, {
			// shouldPlay: true,
			isLooping: true,
		});
		mergedVoiceSound = sound;
		// this.toggleKeepMergedVoicesAudioSessionAlive(true);
	}

	toggleKeepMergedVoicesAudioSessionAlive(bool) {
		if (!bool) {
			clearInterval(keepMergedVoicesAudioSessionAliveInterval);
		} else {
			const callback = () => {
				console.log('setPositionAsync', 0);
				mergedVoiceSound.setPositionAsync(0);
			};
			callback();
			keepMergedVoicesAudioSessionAliveInterval = setInterval(callback, 1000);
		}
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
