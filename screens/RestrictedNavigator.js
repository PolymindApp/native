import React from 'react';
import { Platform } from 'react-native';
import I18n from '../locales/i18n';
import ForgotPasswordScreen from "./restricted/ForgotPasswordScreen";
import RegisterScreen from "./restricted/RegisterScreen";
import LoginScreen from "./restricted/LoginScreen";
import WelcomeScreen from "./restricted/WelcomeScreen";
import {CardStyleInterpolators, createStackNavigator} from "@react-navigation/stack";
import ConfirmationScreen from "./restricted/ConfirmationScreen";
import { THEME } from '@polymind/sdk-js';

const Stack = createStackNavigator();
const INITIAL_ROUTE_NAME = 'Welcome';

export default function AppNavigator({ navigation, route }) {
	const headerMode = Platform.OS === 'ios' ? 'float' : 'none';
	return (
		<Stack.Navigator headerMode={headerMode} initialRouteName={'Welcome'} screenOptions={{
			headerStyle: {
				backgroundColor: THEME.primary,
				shadowColor: 'transparent',
				elevation: 0,
				shadowOpacity: 0
			},
			headerTintColor: '#fff',
			headerStatusBarHeight: 0,
			headerTruncatedBackTitle: I18n.t('btn.back'),
			headerTitle: false,
			headerTransparent: true,
			cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
		}}>
			<Stack.Screen name="Welcome" component={WelcomeScreen} options={{
				headerShown: false
			}} />
			<Stack.Screen name="Login" component={LoginScreen} />
			<Stack.Screen name="Register" component={RegisterScreen} />
			<Stack.Screen name="RegisterEmailSent" component={ConfirmationScreen} initialParams={{
				icon: 'email-check',
				title: I18n.t('restricted.registerEmailSentTitle'),
				subtitle: I18n.t('restricted.registerEmailSentSubtitle'),
				footerTitle: I18n.t('restricted.backToLogin'),
				footerNavigation: 'Login'
			}} />
			<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
			<Stack.Screen name="ForgotPasswordEmailSent" component={ConfirmationScreen} initialParams={{
				icon: 'email-check',
				title: I18n.t('restricted.forgotPasswordSentTitle'),
				subtitle: I18n.t('restricted.forgotPasswordSentSubtitle'),
				footerTitle: I18n.t('restricted.backToLogin'),
				footerNavigation: 'Login'
			}} />
		</Stack.Navigator>
	);
}
