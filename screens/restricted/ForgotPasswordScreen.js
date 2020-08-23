import React from 'react';
import { Linking } from 'expo';
import {StyleSheet, Vibration, Alert} from "react-native";
import {Button, Input, Text} from "react-native-elements";
import { THEME, UserService, Rules } from "@polymind/sdk-js";
import I18n from '../../locales/i18n';
import ClassicForm from "../../components/ClassicForm";

export default class ForgotPasswordScreen extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			email: props.route?.params?.defaultEmail || '',
		}
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
		UserService.forgotPassword(this.state.email, Linking.makeUrl('/verify-email'))
			.then(response => {
				navigation.navigate('ForgotPasswordEmailSent');
			})
			.catch(err => {
				let type = 'unknown';
				let buttons = [
					{ text: I18n.t('btn.ok'), style: 'cancel' }
				];
				switch (parseInt(err.code)) {
					case 103:
						type = 'userInactive';
						buttons = [
							{ text: I18n.t('btn.cancel'), style: 'cancel' },
							{ text: I18n.t('btn.resendActivation'), onPress: () => {
									this.setState({ loading: true });
									UserService.resendActivation(this.state.email, Linking.makeUrl('/verify-email'))
										.then(response => {
											navigation.navigate('VerifyEmailSent');
										})
										.catch(err => {
											console.log(err.code, err);
										}).finally(() => this.setState({ loading: false }))
							}}
						];
						break;
					case 107: type = 'userNotFound'; break;
				}

				Vibration.vibrate();
				Alert.alert(
					I18n.t('error.' + type + 'Title'),
					I18n.t('error.' + type + 'Desc', { email: this.state.email }),
					buttons,
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
					defaultValue={this.state.email}
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
					disabled={!this.formIsValid() || this.state.loading}
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
