import React from 'react';
import { Linking } from 'expo';
import {StyleSheet, Vibration, Alert} from "react-native";
import {Button, Input, Text} from "react-native-elements";
import { THEME, UserService, Rules } from "@polymind/sdk-js";
import I18n from '../../locales/i18n';
import ClassicForm from "../../components/ClassicForm";

export default class ResetPasswordScreen extends React.Component {

	state = {
		loading: false,
		email: '',
		password: '',
		confirmation: '',
	}

	constructor() {
		super();
		this.refInputs = [
			React.createRef(),
			React.createRef(),
			React.createRef(),
		]
	}

	formIsValid() {
		return Rules.required(this.state.password) && Rules.min(8, this.state.password)
			&& Rules.identical(this.state.password, this.state.confirmation);
	}

	sendRequest() {

		if (!this.formIsValid()) {
			return;
		}

		const { navigation, route } = this.props;

		this.setState({ saving: true });
		UserService.resetPassword(route.params.token, this.state.password)
			.then(response => {
				navigation.navigate('ResetPasswordDone');
			})
			.catch(err => {
				console.log(err);
				Vibration.vibrate();
				Alert.alert(
					I18n.t('error.tokenExpiredTitle'),
					I18n.t('error.tokenExpiredDesc'),
					[
						{ text: I18n.t('btn.ok'), style: 'cancel', onPress: () => {
							navigation.navigate('ForgotPassword');
						} },
					],
					{ cancelable: false }
				);
			})
			.finally(() => this.setState({ saving: false }));
	}

	render() {
		const { navigation } = this.props;

		return (
			<ClassicForm icon={'shield-lock'} title={I18n.t('restricted.resetPasswordTitle')}>
				<Input
					placeholder={I18n.t('field.passwordPlaceholder')}
					leftIcon={{ name: 'shield-lock', color: THEME.primary }}
					inputStyle={{color:THEME.primary}}
					secureTextEntry={true}
					onChangeText={value => this.setState({ password: value })}
					returnKeyType = {"next"}
					textContentType='password'
					autoCapitalize='none'
					ref={ref => { this.refInputs[1] = ref }}
					onSubmitEditing={() => this.refInputs[2].focus()}
				/>
				<Input
					placeholder={I18n.t('field.confirmationPlaceholder')}
					leftIcon={{ name: 'shield-check', color: THEME.primary }}
					inputStyle={{color:THEME.primary}}
					secureTextEntry={true}
					onChangeText={value => this.setState({ confirmation: value })}
					returnKeyType = {"done"}
					textContentType='password'
					autoCapitalize='none'
					ref={ref => { this.refInputs[2] = ref }}
					onSubmitEditing={() => this.sendRequest()}
				/>
				<Button
					type="solid"
					title={I18n.t('btn.resetPassword')}
					titleStyle={{
						marginLeft: 10,
					}}
					loading={this.state.saving}
					onPress={() => this.sendRequest()}
					disabled={!this.formIsValid() || this.state.saving}
				/>
			</ClassicForm>
		)
	}
}
