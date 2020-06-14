import React from 'react';
import {StyleSheet, View, Vibration, Alert, Keyboard} from "react-native";
import {Button, Icon, Input, Text, SocialIcon} from "react-native-elements";
import { THEME, Rules } from "@polymind/sdk-js";
import I18n from '../../locales/i18n';
import ClassicForm from "../../components/ClassicForm";
import SocialLogin from "../../components/SocialLogin";

export default class RegisterScreen extends React.Component {

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
		return Rules.required(this.state.email) && Rules.email(this.state.email)
			&& Rules.required(this.state.password) && Rules.min(8, this.state.password);
	}

	register() {

		if (!this.formIsValid()) {
			return;
		}

		this.setState({ loading: true });
		UserService.register(this.state.email, this.state.password)
			.then(response => {
				navigation.navigate('RegisterEmailSent');
			})
			.catch(err => {
				Vibration.vibrate();
				Alert.alert(
					I18n.t('error.userAlreadyExistTitle'),
					I18n.t('error.userAlreadyExistDesc'),
					[
						{ text: I18n.t('btn.cancel'), style: 'cancel' },
						{
							text: I18n.t('btn.signIn'),
							onPress: () => {
								navigation.navigate('Login');
							}
						},
					],
					{ cancelable: false }
				);
			})
			.finally(() => this.setState({ loading: false }));
	}

	render() {
		const { navigation } = this.props;
		return (
			<ClassicForm icon={'account-plus'} title={I18n.t('restricted.registerTitle')} footer={
				<View>
					<View style={{ flexDirection: 'row', marginTop: -25, marginBottom: 15, justifyContent: 'center'}}>
						<Text style={{backgroundColor: '#f3f3f3', paddingHorizontal: 15}}>{I18n.t('restricted.orRegisterUsing')}</Text>
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
					onChangeText={value => this.setState({ email: value })}
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
					onSubmitEditing={() => this.register()}
				/>
				<Button
					type="solid"
					title={I18n.t('restricted.register')}
					titleStyle={{
						marginLeft: 10,
					}}
					loading={this.state.loading}
					onPress={() => this.register()}
					disabled={!this.formIsValid()}
				/>
			</ClassicForm>
		)
	}
}
