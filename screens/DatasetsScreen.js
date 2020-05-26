import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React, { Component } from 'react'
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { RectButton, ScrollView } from 'react-native-gesture-handler';
import PolymindSDK from '@polymind/sdk-js';

const $polymind = new PolymindSDK('http://server.directus.polymind.localhost/');



function wait(timeout) {
	return new Promise(resolve => {
		setTimeout(resolve, timeout);
	});
}

class AccountScreen extends Component {

	state = {
		datasets: []
	}

	load() {
		$polymind.getDatasets().then(datasets => {
			const items = [];
			datasets.forEach(dataset => {
				items.push(<OptionButton
					icon="md-school"
					label={dataset.name}
					onPress={() => WebBrowser.openBrowserAsync('https://docs.expo.io')}
				/>);
			});
			this.setState({ datasets: items });
		});
	}

	componentDidMount() {
		this.load();
	}

	render() {

		// const [refreshing, setRefreshing] = React.useState(false);
		// const onRefresh = React.useCallback(() => {
		// 	setRefreshing(true);
		// 	wait(2000).then(() => setRefreshing(false));
		// }, [refreshing]);

		return (
			// <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} refreshControl={
			// 	<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
			// }>
			<ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
				{this.state.datasets}
			</ScrollView>
		);
	}
}

function OptionButton({ icon, label, onPress, isLastOption }) {
	return (
		<RectButton style={[styles.option, isLastOption && styles.lastOption]} onPress={onPress}>
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.optionIconContainer}>
					<Ionicons name={icon} size={22} color="rgba(0,0,0,0.35)" />
				</View>
				<View style={styles.optionTextContainer}>
					<Text style={styles.optionText}>{label}</Text>
				</View>
			</View>
		</RectButton>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fafafa',
	},
	contentContainer: {
		paddingTop: 15,
	},
	optionIconContainer: {
		marginRight: 12,
	},
	option: {
		backgroundColor: '#fdfdfd',
		paddingHorizontal: 15,
		paddingVertical: 15,
		borderWidth: StyleSheet.hairlineWidth,
		borderBottomWidth: 0,
		borderColor: '#ededed',
	},
	lastOption: {
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	optionText: {
		fontSize: 15,
		alignSelf: 'flex-start',
		marginTop: 1,
	},
});

export default AccountScreen;
