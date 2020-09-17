import * as ScreenOrientation from 'expo-screen-orientation';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator} from '@react-navigation/stack';
import * as React from 'react';
import { ThemeProvider} from 'react-native-elements';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import {SafeAreaView, Platform, StatusBar, StyleSheet, View, ActivityIndicator, TouchableWithoutFeedback, Keyboard} from 'react-native';
import PolymindSDK, { THEME, EventBus } from '@polymind/sdk-js';
import LinkingConfiguration from './navigation/LinkingConfiguration';
import I18n from './locales/i18n';
import { AppContext } from './contexts';
import AppNavigator from './screens/AppNavigator';
import RestrictedNavigator from "./screens/RestrictedNavigator";
import WelcomeScreen from "./screens/app/welcome/WelcomeScreen";
const Stack = createStackNavigator();
const navigationRef = React.createRef();
import * as Font from 'expo-font';

Font.loadAsync({
	'geomanist': require('./assets/fonts/Geomanist.ttf'),
	'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
	'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
	'open-sans-light': require('./assets/fonts/OpenSans-Light.ttf'),
});

const themePaper = {
	...DefaultTheme,
	roundness: 2,
	colors: {
		...DefaultTheme.colors,
		primary: THEME.primary,
		accent: THEME.primary,
	},
};
const theme = {
	colors: {
		...DefaultTheme.colors,
		primary: THEME.primary,
		accent: THEME.primary,
	},
	Button: {
		raised: false,
	},
	Icon: {
		type: "material-community",
	}
};

if (Platform.OS !== 'web') {
	ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
}

// console.disableYellowBox = true;

const $polymind = new PolymindSDK();
export default class App extends React.Component {

	static contextType = AppContext;

	state = {
		hasVerifiedAuth: false,
		isSignedIn: false,
		setSignedIn: (bool) => {
			this.setState({ isSignedIn: bool });

			if (bool) {
				console.log('signed-in');
				navigationRef?.current?.navigate(global.user.settings.native.welcomeScreen ? 'App' : 'Welcome');
			} else {
				console.log('signed-out');
			}
		},
	}

	async componentDidMount() {
		await I18n.initAsync();

		EventBus.subscribe('LOGOUT', () => {
			this.context.setSignedIn(false);
		});

		let isSignedIn = false;
		$polymind.me().then(user => {
			isSignedIn = true;
			global.user = user;
			navigationRef?.current?.navigate(global.user.settings.native.welcomeScreen ? 'App' : 'Welcome');
		})
			.catch(err => console.log('not logged in'))
			.finally(response => {
				this.setState({ isSignedIn, hasVerifiedAuth: true })
			});
	}

	render() {

		if (!this.state.hasVerifiedAuth) {
			return (
				<View style={styles.loading}>
					<ActivityIndicator size="large" color="white" />
				</View>
			);
		}

		return (
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<ThemeProvider theme={theme}>
					<PaperProvider theme={themePaper}>
						<AppContext.Provider value={this.state}>
							<StatusBar barStyle="light-content" backgroundColor={'transparent'} translucent hidden={!this.state.isSignedIn} />
							<NavigationContainer ref={navigationRef} linking={LinkingConfiguration}>
								{this.state.isSignedIn ? (
									<SafeAreaView style={styles.container}>
										<Stack.Navigator initialRouteName={'App'}>
											<Stack.Screen name="App" component={AppNavigator} options={{
												headerShown: false
											}} />
											{!global.user.settings.native.welcomeScreen && <Stack.Screen name="Welcome" component={WelcomeScreen} options={{
												headerShown: false
											}} />}
										</Stack.Navigator>
									</SafeAreaView>
									) : (<RestrictedNavigator />)}
							</NavigationContainer>
						</AppContext.Provider>
					</PaperProvider>
				</ThemeProvider>
			</TouchableWithoutFeedback>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: THEME.primary,
	},
	loading: {
		flex: 1,
		justifyContent: 'center',
		backgroundColor: THEME.primary,
	}
});
