import React from 'react';
import { THEME } from '@polymind/sdk-js';
import TabBarIcon from '../components/TabBarIcon';
import NotesNavigator from "./app/NotesNavigator";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import SessionsNavigator from "./app/SessionsNavigator";
import ProfileNavigator from "./app/ProfileNavigator";
import I18n from '../locales/i18n';

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Sessions';

export default class AppNavigator extends React.Component {

	state = {
		keyboardVisible: false,
	}

	render() {

		const { navigation } = this.props;

		return (
			<BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME} tabBarOptions={{
				activeTintColor: THEME.primary,
				style: {
					borderTopWidth: 0,
				}
			}}>
				<BottomTab.Screen
					name="Sessions"
					component={SessionsNavigator}
					options={{
						tabBarLabel: I18n.t('navigation.sessions'),
						tabBarVisible: !this.state.keyboardVisible,
						tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="timelapse" />,
					}}
				/>
				<BottomTab.Screen
					name="Notes"
					component={NotesNavigator}
					options={{
						title: I18n.t('navigation.notes'),
						tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="book-open" />,
					}}
				/>
				<BottomTab.Screen
					name="Profile"
					component={ProfileNavigator}
					options={{
						title: I18n.t('navigation.profile'),
						tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="account-circle" />,
					}}
				/>
			</BottomTab.Navigator>
		);
	}
}
