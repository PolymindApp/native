import {CardStyleInterpolators, createStackNavigator} from "@react-navigation/stack";
import React from 'react';
import Storage from '../../components/storage';
import NotesScreen from "./notes/NotesScreen";
import I18n from '../../locales/i18n';
import DataScreen from "./notes/DataScreen";
import ColumnEditScreen from "./notes/ColumnEditScreen";
import { THEME } from '@polymind/sdk-js';
import DataEditScreen from "./notes/DataEditScreen";
import PageScreen from "../shared/PageScreen";

const Stack = createStackNavigator();
const INITIAL_ROUTE_NAME = 'Notes';

export default class NotesNavigator extends React.Component {

	state = {
		loading: false,
		params: {},
	}

	render() {
		const { navigation, route } = this.props;

		return (
			<Stack.Navigator initialRouteName={INITIAL_ROUTE_NAME} screenOptions={{
				headerTintColor: 'white',
				headerTruncatedBackTitle: I18n.t('btn.back'),
				headerStyle: { backgroundColor: THEME.primary },
				cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
			}}>
				<Stack.Screen name="Notes" component={NotesScreen} />
				<Stack.Screen name="NotesData" component={DataScreen} />
				<Stack.Screen name="NotesDataEdit" component={DataEditScreen} />
				<Stack.Screen name="NotesColumnEdit" component={ColumnEditScreen} />
				<Stack.Screen name="ProfilePage" component={PageScreen} options={{
					title: I18n.t('state.loading'),
				}} />
			</Stack.Navigator>
		);
	}
}
