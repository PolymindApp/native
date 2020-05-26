import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Image, Platform, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

function wait(timeout) {
	return new Promise(resolve => {
		setTimeout(resolve, timeout);
	});
}

export default function DashboardScreen() {

	const [refreshing, setRefreshing] = React.useState(false);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		wait(2000).then(() => setRefreshing(false));
	}, [refreshing]);

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} refreshControl={
			<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
		}>
			<View style={styles.welcomeContainer}>
				<Text>TEST</Text>
			</View>
		</ScrollView>
    );
}

DashboardScreen.navigationOptions = {
    header: null,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        paddingTop: 30,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
});
