import React from 'react'
import {StyleSheet, Text, View} from 'react-native';
import * as StoreReview from 'expo-store-review';
import {Button} from "react-native-paper";
import { THEME } from "@polymind/sdk-js";

export default class DebugScreen extends React.Component {

	state = {

	};

	requestReview() {
		if (StoreReview.isAvailableAsync()) {
			StoreReview.requestReview(); // Will not show if asked more than 3 times in a year or if disable in user's settings
		}
	};

	render() {
		return (
			<View style={{flex: 1, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0, 0, 0, 0.075)'}}>
				<View style={{marginTop: 15}}>
					<View style={{marginHorizontal: 10, padding: 10, backgroundColor: 'white', borderRadius: 10}}>
						<Button mode={'outlined'} onPress={() => this.requestReview()}>
							Request App Review
						</Button>
					</View>
				</View>
			</View>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	desc: {
		margin: 10,
		marginTop: 0,
		color: 'rgba(0, 0, 0, 0.33)',
		fontSize: 12,
	}
});
