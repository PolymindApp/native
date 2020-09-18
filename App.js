import React from 'react';
import LanguageSelector from "./shared/LanguageSelector";
import Filters from "./shared/Filters";
import Connected from "./routes/Connected";
import SettingsHierarchy from "./shared/SettingsHierarchy";
import Page from "./routes/connected/Page";
import Word from "./routes/connected/Word";
import Feedback from "./routes/connected/Feedback";
import SettingsContext, { SettingsContextInitialState } from './contexts/SettingsContext';
import merge from 'deepmerge';
import { theme } from './theme';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { AsyncStorage, TouchableWithoutFeedback, Keyboard } from 'react-native';

export default function App() {

	const [settingsState, setSettingsState] = React.useState(SettingsContextInitialState);
	const [loaded, setLoaded] = React.useState(false);

	const assignSettingsState = params => {
		const state = merge(settingsState, params, {
			arrayMerge: (desc, source) => source
		});

		try {
			const json = JSON.stringify(state);
			AsyncStorage.setItem('@polymind:settings', json, error => {
				if (error) {
					console.log('async.mergeItem.error', error);
				}

				setSettingsState(state);

				if (!loaded) {
					setLoaded(true);
				}
			});
		} catch(e) {
			console.log('async.setItem.error', e);
		}
	};

	if (!loaded) {
		AsyncStorage.getItem('@polymind:settings', (error, result) => {
			if (result) {
				try {
					const settings = JSON.parse(result);
					assignSettingsState(settings);
				} catch(e) {
					console.log('async.getItem.error', e);
				}
			}
		});

		return null;
	} else {

		const modalOptions = {
			cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
			headerStyle: {
				backgroundColor: 'white',
			},
			headerTintColor: theme.colors.primary,
		};

		return (
			<PaperProvider theme={theme}>
				<SettingsContext.Provider value={[settingsState, assignSettingsState]}>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<NavigationContainer>
							<Stack.Navigator screenOptions={{
								headerStyle: {
									backgroundColor: theme.colors.primary,
								},
								headerTintColor: 'white',
								cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
							}}>
								<Stack.Screen name="Connected" component={Connected} />
								<Stack.Screen name="LanguageSelector" component={LanguageSelector} options={{
									...modalOptions,
								}} />
								<Stack.Screen name="Filters" component={Filters} options={{
									...modalOptions,
								}} />
								<Stack.Screen name="SettingsHierarchy" component={SettingsHierarchy} />
								<Stack.Screen name="Page" component={Page} />
								<Stack.Screen name="Word" component={Word} />
								<Stack.Screen name="Feedback" component={Feedback} />
							</Stack.Navigator>
						</NavigationContainer>
					</TouchableWithoutFeedback>
				</SettingsContext.Provider>
			</PaperProvider>
		);
	}
}

const Stack = createStackNavigator();
