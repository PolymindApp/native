import React from 'react';
import I18n from "../../locales/i18n";
import { UserService, THEME } from '@polymind/sdk-js';
import {ActivityIndicator, View} from "react-native";
import {Icon, Text} from "react-native-elements";
import {Button} from "react-native-paper";
import ConfirmationScreen from '../restricted/ConfirmationScreen';

export default class RegisterScreen extends React.Component {

	state = {
		verified: false,
		verifying: true,
	}

	componentDidMount() {
		this.verify();
	}

	verify() {
		UserService.activate(this.props.route.params.token).then(response => {
			this.props.navigation.navigate('AccountActivated', {
				footerNavigationParams: {
					defaultEmail: response.data
				}
			});
		}).catch(err => {
			console.log(err.code, err);
			this.setState({ verifying: false });
		})
	}

	render() {
		const { route, navigation } = this.props;

		navigation.setOptions({
			headerShown: false,
		});

		if (this.state.verifying) {
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
				</View>
			);
		}


		return (
			<View style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10, paddingHorizontal: 30}}>
				<Icon name={'account-alert'} size={64} style={{opacity: 0.3}}></Icon>
				<Text style={{textAlign: 'center'}} h3>{I18n.t('error.badTokenTitle')}</Text>
				<Text style={{textAlign: 'center'}} h5>{I18n.t('error.badTokenDesc')}</Text>
				<Button mode="contained" onPress={() => {
					if (navigation.canGoBack()) {
						navigation.popToTop();
					} else {
						navigation.navigate('Welcome');
					}
					navigation.push('Login');
				}} delayPressIn={0} style={{marginTop: 10}}>
					{I18n.t('restricted.backToLogin')}
				</Button>
			</View>
		);
	}
}
