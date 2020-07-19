import {CardStyleInterpolators, createStackNavigator} from "@react-navigation/stack";
import React from 'react';
import GraphScreen from "./dictionary/GraphScreen";
import HelpDictionaryScreen from "./help/HelpDictionaryScreen";
import { THEME } from '@polymind/sdk-js';
import I18n from '../../locales/i18n';
import {AppContext} from "../../contexts";

const Stack = createStackNavigator();

export default class Dictionary extends React.Component {

	static contextType = AppContext;

	render() {
		return (
			<Stack.Navigator initialRouteName={'Graph'} screenOptions={{
				headerTintColor: 'white',
				headerStyle: {
					backgroundColor: THEME.primary,
					shadowColor: 'transparent',
					elevation: 0,
					shadowOpacity: 0
				},
				headerTruncatedBackTitle: I18n.t('btn.back'),
				cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
			}}>
				<Stack.Screen name="Graph" component={GraphScreen} options={{
					title: I18n.t('title.dictionary'),
				}} />
				<Stack.Screen name="HelpDictionary" component={HelpDictionaryScreen} options={{
					title: I18n.t('title.help'),
				}} />
			</Stack.Navigator>
		);
	}
}
