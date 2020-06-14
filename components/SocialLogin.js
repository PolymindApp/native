import Constants from 'expo-constants';
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';
import React from 'react';
import {SocialIcon} from "react-native-elements";
import {View, Alert, Vibration} from "react-native";

export default class SocialLogin extends React.Component {

	componentDidMount() {
		this.initAsync();
	}

	async initAsync() {
		await Facebook.initializeAsync(Constants.manifest.facebookAppId);
		// await GoogleSignIn.initAsync({
		// 	clientId: URLSchemes.REVERSED_CLIENT_ID,
		// });
	}

	async socialLogin(provider) {
		try {
			if (provider === 'google') {
				const { type, accessToken, user } = await Google.logInAsync({
					androidClientId: Constants.manifest.googleClientId,
				});
				if (type === 'success') {
					let userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
						headers: { Authorization: `Bearer ${accessToken}` },
					});
					console.log(userInfoResponse);
				}
			} else if (provider === 'facebook') {
				const {
					type,
					token,
					expires,
					permissions,
					declinedPermissions,
				} = await Facebook.logInWithReadPermissionsAsync({
					permissions: ['public_profile'],
				});
				if (type === 'success') {
					const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
					Alert.alert('Logged in!', `Hi ${(await response.json()).name}!`);
				} else {
					Vibration.vibrate();
				}
			}
		} catch ({ message }) {
			Vibration.vibrate();
			Alert.alert(message);
		}
	}

	render() {
		return (
			<View style={{flexDirection: 'row', justifyContent: 'center'}}>
				<SocialIcon type={'google'} onPress={() => this.socialLogin('google')} />
				<SocialIcon type={'facebook'} onPress={() => this.socialLogin('facebook')} />
				{/*<SocialIcon type={'twitter'} />*/}
				{/*<SocialIcon type={'linkedin'} />*/}
			</View>
		);
	}
}
