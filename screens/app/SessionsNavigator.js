import {CardStyleInterpolators, createStackNavigator} from "@react-navigation/stack";
import React from 'react';
import SessionsScreen from "./sessions/SessionsScreen";
import PlayerScreen from "./sessions/PlayerScreen";
import StatsScreen from "./sessions/StatsScreen";
import { THEME } from '@polymind/sdk-js';
import I18n from '../../locales/i18n';

const Stack = createStackNavigator();
const INITIAL_ROUTE_NAME = 'Sessions';

export default function SessionsNavigator({ navigation, route }) {

	return (
		<Stack.Navigator initialRouteName={INITIAL_ROUTE_NAME} screenOptions={{
			headerTintColor: 'white',
			headerStyle: {
				backgroundColor: THEME.primary,
				shadowColor: 'transparent',
				elevation: 0,
				shadowOpacity: 0
			},
			gestureEnabled: false,
			headerTruncatedBackTitle: I18n.t('btn.back'),
			cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
		}}>
			<Stack.Screen name="Sessions" component={SessionsScreen} />
			<Stack.Screen name="SessionsStats" component={StatsScreen} />
			<Stack.Screen name="SessionsPlayer" component={PlayerScreen} options={{
				cardStyle: { backgroundColor: 'black' },
			}} />
		</Stack.Navigator>
	);
}
