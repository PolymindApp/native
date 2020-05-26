import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as React from 'react';
import { THEME } from '@polymind/sdk-js';

import TabBarIcon from '../components/TabBarIcon';
import DashboardScreen from '../screens/DashboardScreen';
import DatasetsScreen from '../screens/DatasetsScreen';
import AccountScreen from '../screens/AccountScreen';

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Home';

export default function BottomTabNavigator({ navigation, route }) {
    // Set the header title on the parent stack navigator depending on the
    // currently active tab. Learn more in the documentation:
    // https://reactnavigation.org/docs/en/screen-options-resolution.html
    navigation.setOptions({ headerTitle: getHeaderTitle(route) });

    return (
        <BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME} tabBarOptions={{
			activeTintColor: THEME.primary,
		}}>
            <BottomTab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
					tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="view-dashboard" />,
                }}
            />
            <BottomTab.Screen
                name="Datasets"
                component={DatasetsScreen}
                options={{
                    title: 'Datasets',
                    tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="database" />,
                }}
            />
            <BottomTab.Screen
                name="Profile"
                component={AccountScreen}
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="account-circle" />,
                }}
            />
        </BottomTab.Navigator>
    );
}

function getHeaderTitle(route) {
    const routeName = route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;

    switch (routeName) {
        case 'Dashboard':
            return 'Dashboard';
        case 'Datasets':
            return 'My Datasets';
        case 'Profile':
            return 'My Account';
    }
}
