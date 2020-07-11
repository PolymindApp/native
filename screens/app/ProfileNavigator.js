import {CardStyleInterpolators, createStackNavigator} from "@react-navigation/stack";
import React from 'react';
import ProfileScreen from "./profile/ProfileScreen";
import InformationsScreen from "./profile/InformationsScreen";
import { THEME } from '@polymind/sdk-js';
import I18n from '../../locales/i18n';
import {Platform, Text, TouchableOpacity, View, Alert, Image} from "react-native";
import {Button} from "react-native-paper";
import {AppContext} from "../../contexts";
import PolymindSDK from "@polymind/sdk-js";
import ActivitiesScreen from "./profile/ActivitiesScreen";
import SettingsScreen from "./profile/SettingsScreen";
import PageScreen from "../shared/PageScreen";

const $polymind = new PolymindSDK();
const Stack = createStackNavigator();
const INITIAL_ROUTE_NAME = 'Profile';

export default class ProfileNavigator extends React.Component {

	static contextType = AppContext;

	logout() {
		Alert.alert(I18n.t('alert.signOutTitle'), I18n.t('alert.signOutDesc'), [
			{ text: I18n.t('btn.signOut'), onPress: () => {
				$polymind.logout().then(() => {
					this.context.setSignedIn(false);
				});
			} },
			{ text: I18n.t('btn.cancel'), style: "cancel" }
		], { cancelable: false });
	}

	render() {
		return (
			<Stack.Navigator initialRouteName={INITIAL_ROUTE_NAME} screenOptions={{
				headerTintColor: 'white',
				headerStyle: { backgroundColor: THEME.primary },
				headerTruncatedBackTitle: I18n.t('btn.back'),
				cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
			}}>
				<Stack.Screen name="Profile" component={ProfileScreen} options={{
					title: I18n.t('title.profile'),
					headerRight: () => (
						<View style={{marginRight: 10}}>
							{Platform.select({
								ios: (<TouchableOpacity onPress={() => this.logout()} hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}>
									<Text style={{color: 'white'}}>{I18n.t('btn.signOut')}</Text>
								</TouchableOpacity>),
								default: (<Button onPress={() => this.logout()} icon="logout-variant" color={'white'}>
									{I18n.t('btn.signOut')}
								</Button>)
							})}
						</View>
					)
				}} />
				<Stack.Screen name="ProfileActivities" component={ActivitiesScreen} options={{
					title: I18n.t('title.profileActivities'),
				}} />
				<Stack.Screen name="ProfileInformations" component={InformationsScreen} options={{
					title: I18n.t('title.profileInformations'),
				}} />
				<Stack.Screen name="ProfileSettings" component={SettingsScreen} options={{
					title: I18n.t('title.profileSettings'),
				}} />
				<Stack.Screen name="ProfilePage" component={PageScreen} />
			</Stack.Navigator>
		);
	}
}
