import React from 'react';
import Cards from '../routes/connected/Cards';
import Sessions from '../routes/connected/Sessions';
import Settings from '../routes/connected/Settings';
import I18n from '../locales/i18n';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { theme } from '../theme';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

export default function Navigation({ navigation, route }) {

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: I18n.t('title.' + (getFocusedRouteNameFromRoute(route) || initialRouteName).toLowerCase())
		});
	}, [navigation, route]);

	return (
		<Tab.Navigator
			keyboardHidesNavigationBar={false}
			initialRouteName={initialRouteName}
			activeColor={theme.colors.primary}
			barStyle={{
				backgroundColor: 'white'
			}}
			shifting={true}
		>
			<Tab.Screen name="Translate" component={Cards} options={{
				tabBarIcon: 'translate',
			}} />
			<Tab.Screen name="Sessions" component={Sessions} options={{
				tabBarIcon: 'headphones',
			}} />
			<Tab.Screen name="Settings" component={Settings} options={{
				tabBarIcon: 'settings',
			}} />
		</Tab.Navigator>
	)
}

const Tab = createMaterialBottomTabNavigator();
const initialRouteName = 'Translate';
