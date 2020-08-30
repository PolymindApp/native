import Constants from 'expo-constants';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-google-app-auth';
import React from 'react';
import {SocialIcon} from "react-native-elements";
import {View, Vibration, ActivityIndicator, Platform, Alert} from "react-native";
import PolymindSDK, { User, THEME, SSOService, FileService, UserService } from '@polymind/sdk-js';
import {AppContext} from "../contexts";
import I18n from "../locales/i18n";
// import * as Facebook from 'expo-facebook';

const majorVersion = parseInt(Platform.Version, 10);
const $polymind = new PolymindSDK();

export default class SocialLogin extends React.Component {

	static contextType = AppContext;

	state = {
		logging: false,
	}

	componentDidMount() {
		this.initAsync();
	}

	async initAsync() {
		// await Facebook.initializeAsync(Constants.manifest.facebookAppId, Constants.manifest.facebookDisplayName);
	}

	async socialLogin(provider) {

		const { navigation } = this.props;

		const signInCallback = (provider, token, meta, photo) => {
			this.setState({ logging: true });
			return SSOService.login(provider, token, meta).then(response => {
				return $polymind.login(response.email, response.tempHash).then(loginResponse => {
					global.user = loginResponse.data.user;
					if (response.wasNew && photo) {
						return FileService.uploadFromUrl(photo).then(fileResponse => {
							return UserService.update(response.data.user.id, {
								avatar: fileResponse.data.id
							});
						}).finally(() => {
							this.context.setSignedIn(true);
						});
					} else {
						this.context.setSignedIn(true);
					}
				});
			});
		};

		try {
			if (provider === 'google') {
				const { type, accessToken, user, test, idToken } = await Google.logInAsync({
					iosStandaloneAppClientId: '285103854117-dtao7us31rfubnrdo0bkt2ifqlp4pud8.apps.googleusercontent.com',
					iosClientId: '285103854117-p5c9kagi2ld9dct6en9qqo1iqo93vok4.apps.googleusercontent.com',
					androidStandaloneAppClientId: '285103854117-n9pudumhl6bfg3aibr30mgg7f3b5edns.apps.googleusercontent.com',
					androidClientId: "285103854117-cpt6mn8hnpkhf840nadpll0qq43v3acf.apps.googleusercontent.com",
				});
				if (type === 'success') {
					signInCallback(provider, idToken, undefined, user.photoUrl);
				} else {
					Vibration.vibrate();
				}
			} else if (provider === 'facebook') {
				// const {type, token, expires, permissions, declinedPermissions} = await Facebook.logInWithReadPermissionsAsync(Constants.manifest.facebookAppId, {
				// 	permissions: ['public_profile', 'email', 'user_photos'],
				// });
				// if (type === 'success') {
				// 	const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.width(200).height(200)&type=large&access_token=${token}`);
				// 	const user = await response.json();
				// 	const photo = user.picture?.data?.url ? user.picture.data.url : null;
				// 	console.log(provider, type, token, expires, permissions, declinedPermissions, photo);
				// 	signInCallback(provider, token, undefined, photo);
				// } else {
				// 	Vibration.vibrate();
				// }
			} else if (provider === 'apple') {
				const credential = await AppleAuthentication.signInAsync({
					requestedScopes: [
						AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
						AppleAuthentication.AppleAuthenticationScope.EMAIL,
					],
				});
				signInCallback(provider, credential.identityToken, credential);
			}
		} catch ({ message }) {
			// Alert.alert(I18n.t('error.ssoLoginTitle'), I18n.t('error.ssoLoginDesc'));
			console.log('error', message);
			Vibration.vibrate();
			this.setState({ logging: false });
		}
	}

	render() {

		const { style, ...rest } = this.props;

		if (this.state.logging) {
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10}}>
					<ActivityIndicator size="large" color={THEME.primary} />
				</View>
			);
		}

		return (
			<View style={[{flexDirection: 'row', justifyContent: 'center'}, style]} {...rest}>
				{Platform.OS === 'ios' && majorVersion >= 13 && <SocialIcon type={'apple'} style={{backgroundColor: '#1c1c1e'}} onPress={() => this.socialLogin('apple')} />}
				<SocialIcon type={'google'} onPress={() => this.socialLogin('google')} />
				{/*<SocialIcon type={'facebook'} onPress={() => this.socialLogin('facebook')} />*/}
			</View>
		);
	}
}
