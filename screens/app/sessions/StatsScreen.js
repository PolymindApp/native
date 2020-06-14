import React from 'react'
import {Platform, StyleSheet} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PolymindSDK from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';
import {Text} from "react-native-elements";

const $polymind = new PolymindSDK();

export default class StatsScreen extends React.Component {

	state = {

	};

	render() {

		const { navigation } = this.props;
		const { session } = this.props.route.params;

		navigation.setOptions({
			title: session.title
		});

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
