import React from 'react';
import Navigation from "../shared/Navigation";
import { styles } from "../styles";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function Connected(props) {
	return (
		<View style={styles.max}>
			<StatusBar style="light" />
			<Navigation {...props} />
		</View>
	);
}
