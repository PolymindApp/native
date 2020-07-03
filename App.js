import * as ScreenOrientation from 'expo-screen-orientation';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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

const Stack = createStackNavigator();

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
const isLoadingComplete = true;//useCachedResources();
export default class App extends React.Component {

	static contextType = AppContext;

	state = {
		hasVerifiedAuth: false,
		isSignedIn: false,
		setSignedIn: (bool) => {
			this.setState({ isSignedIn: bool });
		},
	}

	async componentDidMount() {
		await I18n.initAsync();

		EventBus.subscribe('LOGOUT', () => {
			this.context.setSignedIn(false);
		});

		$polymind.isLoggedIn().then(isSignedIn => {
			this.setState({ isSignedIn, hasVerifiedAuth: true });
		});
	}

	render() {

		if (!isLoadingComplete) {
			return null;
		}

		return (
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<ThemeProvider theme={theme}>
					<PaperProvider theme={themePaper}>
						<AppContext.Provider value={this.state}>
							<StatusBar barStyle="light-content" backgroundColor={'transparent'} translucent hidden={!this.state.isSignedIn} />

							{!this.state.hasVerifiedAuth ? (
								<View style={styles.loading}>
									<ActivityIndicator size="large" color="white" />
								</View>
							) : (
								<NavigationContainer linking={LinkingConfiguration}>
									{this.state.isSignedIn ? (
										<SafeAreaView style={styles.container}>
											<AppNavigator />
										</SafeAreaView>
										) : (<RestrictedNavigator />)}
								</NavigationContainer>
							)}
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
