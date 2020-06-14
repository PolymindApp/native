import React from 'react';
import {Keyboard, KeyboardAvoidingView, ScrollView, StyleSheet, TouchableWithoutFeedback, View} from "react-native";
import { Divider, Icon, Text} from "react-native-elements";
import { THEME } from "@polymind/sdk-js";

export default class ClassicForm extends React.Component {

	render() {
		const { icon, title, footer, children } = this.props;
		return (
			<ScrollView style={styles.container} contentContainerStyle={styles.content}>

				{/*LOGO*/}
				<View style={styles.header}>
					<Icon name={icon} size={60} color={'white'} />
					<Text style={styles.headerText}>{title}</Text>
				</View>

				{/*FORM*/}
				<View style={{...styles.view, marginVertical: 30, flexGrow: 2}}>
					{children}
				</View>

				{/*FOOTER*/}
				{footer ? (
				<View style={{...styles.view, justifyContent: 'flex-end', marginBottom: 15}}>
					<Divider style={{marginVertical: 15, marginHorizontal: 30}}/>
					{footer}
				</View>
				) : null}
			</ScrollView>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
	},
	content: {
		flexGrow: 1,
		justifyContent: 'center',
	},
	header: {
		flex: 2,
		backgroundColor: THEME.primary,
		justifyContent: 'center',
		alignItems: 'center',
		borderBottomStartRadius: 5000,
		borderBottomEndRadius: 5000,
		marginHorizontal: -100,
		paddingHorizontal: 150,
		marginTop: -200,
		paddingTop: 215,
		paddingBottom: 30,
	},
	headerText: {
		fontSize: 30,
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
	},
	view: {
		marginHorizontal: 30,
		justifyContent: 'center',
	},
	centeredText: {
		textAlign: 'center',
	},
});
