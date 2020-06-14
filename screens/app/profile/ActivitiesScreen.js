import React from 'react'
import {Platform, StyleSheet, Text} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PolymindSDK from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';

const $polymind = new PolymindSDK();

export default class ActivitiesScreen extends React.Component {

	state = {

	};

	render() {
		return (
			<ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>
				<Text>Data</Text>
			</ScrollView>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});
