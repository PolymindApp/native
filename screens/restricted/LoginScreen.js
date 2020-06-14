import React from 'react';
import {
	StyleSheet,
	View,
	Alert,
	Vibration,
	Keyboard,
} from "react-native";
import {Button, Input, Text} from "react-native-elements";
import PolymindSDK, { THEME, Rules } from "@polymind/sdk-js";
import I18n from '../../locales/i18n';
import {AppContext} from "../../contexts";
import ClassicForm from "../../components/ClassicForm";
import SocialLogin from "../../components/SocialLogin";

const $polymind = new PolymindSDK();

export default class LoginScreen extends React.Component {

	static contextType = AppContext;

	state = {
		email: '',
		password: '',
		loading: false,
		errorMessages: {
			email: null,
			password: null,
		},
	}

	constructor() {
		super();
		this.refInputs = [
			React.createRef(),
			React.createRef(),
		]
	}

	formIsValid() {
		return Rules.required(this.state.email) && Rules.email(this.state.email)
			&& Rules.required(this.state.password);
	}

	login() {

		if (!this.formIsValid()) {
			return;
		}

		const { navigation } = this.props;
		this.setState({ loading: true });
		$polymind.login(this.state.email, this.state.password)
			.then(response => {
				this.context.setSignedIn(true);
			})
			.catch(err => {
				Vibration.vibrate();
				Alert.alert(
					I18n.t('error.invalidCredentialsTitle'),
					I18n.t('error.invalidCredentialsDesc'),
					[
						{
							text: I18n.t('restricted.forgotPassword'),
							onPress: () => {
								navigation.navigate('ForgotPassword');
							}
						},
						{ text: I18n.t('btn.ok') }
					],
					{ cancelable: false }
				);
			})
			.finally(() => this.setState({ loading: false }));
	}

	render() {
		const { navigation } = this.props;
		return (
			<ClassicForm icon={'account-circle'} title={I18n.t('restricted.loginTitle')} footer={
				<View>
					<View style={{ flexDirection: 'row', marginTop: -25, marginBottom: 15, justifyContent: 'center'}}>
						<Text style={{backgroundColor: '#f3f3f3', paddingHorizontal: 15}}>{I18n.t('restricted.orLoginUsing')}</Text>
					</View>
					<SocialLogin />
				</View>
			}>
				<Input
					placeholder={I18n.t('field.emailPlaceholder')}
					leftIcon={{ name: 'email-outline', color: THEME.primary }}
					inputStyle={{color:THEME.primary}}
					onChangeText={value => this.setState({ email: value })}
					returnKeyType = {"next"}
					textContentType='username'
					keyboardType='email-address'
					autoCapitalize='none'
					ref={ref => { this.refInputs[0] = ref }}
					onSubmitEditing={() => this.refInputs[1].focus()}
				/>
				<Input
					placeholder={I18n.t('field.passwordPlaceholder')}
					leftIcon={{ name: 'shield-lock', color: THEME.primary }}
					inputStyle={{color:THEME.primary}}
					secureTextEntry={true}
					onChangeText={value => this.setState({ password: value })}
					returnKeyType = {"done"}
					textContentType='password'
					autoCapitalize='none'
					ref={ref => { this.refInputs[1] = ref }}
					onSubmitEditing={() => this.login()}
				/>
				<Button
					type="solid"
					title={I18n.t('restricted.login')}
					titleStyle={{
						marginLeft: 10,
					}}
					disabled={!this.formIsValid()}
					loading={this.state.loading}
					onPress={() => this.login()}
				/>
				<Button
					title={I18n.t('restricted.forgotPassword')}
					type="clear"
					buttonStyle={{marginTop: 5}}
					onPress={() => navigation.navigate('ForgotPassword')}
				/>
			</ClassicForm>
		)
	}
}
