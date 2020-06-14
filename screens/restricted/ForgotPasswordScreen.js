import React from 'react';
import {
	StyleSheet,
	Vibration,
	Alert,
	Keyboard,
} from "react-native";
import {Button, Input, Text} from "react-native-elements";
import { THEME, UserService, Rules } from "@polymind/sdk-js";
import I18n from '../../locales/i18n';
import ClassicForm from "../../components/ClassicForm";

export default class ForgotPasswordScreen extends React.Component {

	state = {
		loading: false,
		email: '',
	}

	formIsValid() {
		return Rules.required(this.state.email) && Rules.email(this.state.email);
	}

	sendRequest() {

		if (!this.formIsValid()) {
			return;
		}

		const { navigation } = this.props;
		this.setState({ loading: true });
		UserService.forgotPassword(this.state.email)
			.then(response => {
				navigation.navigate('ForgotPasswordEmailSent');
			})
			.catch(err => {
				Vibration.vibrate();
				Alert.alert(
					I18n.t('error.userNotFoundTitle'),
					I18n.t('error.userNotFoundDesc', { email: this.state.email }),
					[
						{ text: I18n.t('btn.ok'), }
					],
					{ cancelable: false }
				);
			})
			.finally(() => this.setState({ loading: false }));
	}

	render() {
		const { navigation } = this.props;
		return (
			<ClassicForm icon={'shield-off'} title={I18n.t('restricted.forgotPasswordTitle')}>
				<Text style={{...styles.centeredText, marginBottom: 15 }}>{I18n.t('restricted.forgotPasswordDesc')}</Text>

				<Input
					placeholder={I18n.t('field.emailPlaceholder')}
					leftIcon={{ name: 'email-outline', color: THEME.primary }}
					inputStyle={{color:THEME.primary}}
					onChangeText={value => this.setState({ email: value })}
					returnKeyType = {"done"}
					textContentType='username'
					keyboardType='email-address'
					autoCapitalize='none'
					onSubmitEditing={() => this.sendRequest()}
				/>
				<Button
					type="solid"
					title={I18n.t('btn.continue')}
					titleStyle={{
						marginLeft: 10,
					}}
					loading={this.state.loading}
					onPress={() => this.sendRequest()}
					disabled={!this.formIsValid()}
				/>
			</ClassicForm>
		)
	}
}

const styles = StyleSheet.create({
	centeredText: {
		textAlign: 'center',
	},
});
