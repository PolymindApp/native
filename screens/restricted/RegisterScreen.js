import React from 'react';
import {View, Vibration, Alert} from "react-native";
import {Button, Input, Text} from "react-native-elements";
import { THEME, Rules, UserService } from "@polymind/sdk-js";
import I18n from '../../locales/i18n';
import ClassicForm from "../../components/ClassicForm";
import SocialLogin from "../../components/SocialLogin";
import {Linking} from "expo";

export default class RegisterScreen extends React.Component {

	constructor(props) {
		super(props);
		this.refInputs = [
			React.createRef(),
			React.createRef(),
			React.createRef(),
		];
		this.state = {
			saving: false,
			email: props.route?.params?.defaultEmail || '',
			password: '',
			confirmation: '',
		}
	}

	formIsValid() {
		return Rules.required(this.state.email) && Rules.email(this.state.email)
			&& Rules.required(this.state.password) && Rules.min(8, this.state.password)
			&& Rules.identical(this.state.password, this.state.confirmation);
	}

	register() {

		if (!this.formIsValid()) {
			return;
		}

		const { navigation } = this.props;

		this.setState({ saving: true });
		UserService.register(this.state.email, this.state.password, Linking.makeUrl('/verify-email'))
			.then(response => {
				navigation.navigate('RegisterEmailSent');
			})
			.catch(err => {

				console.log(err.code, err);

				let type = 'unknown';
				let buttons = [
					{ text: I18n.t('btn.cancel'), style: 'cancel' },
				];
				switch (parseInt(err.code)) {
					case 204:
						type = 'userAlreadyExist';
						buttons.push({
							text: I18n.t('btn.signIn'),
							onPress: () => {
								navigation.navigate('Login', {
									defaultEmail: this.state.email,
								});
							}
						});
						break;
				}

				Vibration.vibrate();
				Alert.alert(
					I18n.t('error.' + type + 'Title'),
					I18n.t('error.' + type + 'Desc'),
					buttons,
					{ cancelable: false }
				);
			})
			.finally(() => this.setState({ saving: false }));
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
					defaultValue={this.state.email}
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
					loading={this.state.saving}
					onPress={() => this.register()}
					disabled={!this.formIsValid() || this.state.saving}
				/>
			</ClassicForm>
		)
	}
}
