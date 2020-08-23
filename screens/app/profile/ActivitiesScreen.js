import React from 'react'
import {Platform, StyleSheet, Text, View} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PolymindSDK from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';

const $polymind = new PolymindSDK();

export default class ActivitiesScreen extends React.Component {

	state = {

	};

	render() {
		return (
			<View style={{flex: 1, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0, 0, 0, 0.075)'}}>
				<ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>
					<Text>Data</Text>
				</ScrollView>
			</View>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});
