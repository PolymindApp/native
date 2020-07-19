import React from 'react';
import {Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Animated, View} from "react-native";
import { Divider, Icon, Text} from "react-native-elements";
import { THEME } from "@polymind/sdk-js";

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

export default class ClassicForm extends React.Component {

	keyboardHeight = new Animated.Value(0);
	fontSize = new Animated.Value(26);
	fontWidth = new Animated.Value(250);
	iconSize = new Animated.Value(60);

	state = {
		keyboardVisible: false,
	}

	componentDidMount() {
		this.keyboardWillShowListener = Keyboard.addListener("keyboardWillShow", event => {
			Animated.parallel([
				Animated.timing(this.keyboardHeight, {duration: event.duration, toValue: event.endCoordinates.height,}),
				Animated.timing(this.fontSize, {duration: event.duration, toValue: 16,}),
				Animated.timing(this.fontWidth, {duration: event.duration, toValue: 160,}),
				Animated.timing(this.iconSize, {duration: event.duration, toValue: 32,}),
			]).start();
		});
		this.keyboardWillHideListener = Keyboard.addListener("keyboardWillHide", event => {
			Animated.parallel([
				Animated.timing(this.keyboardHeight, {duration: event.duration, toValue: 0,}),
				Animated.timing(this.fontSize, {duration: event.duration, toValue: 26,}),
				Animated.timing(this.fontWidth, {duration: event.duration, toValue: 250,}),
				Animated.timing(this.iconSize, {duration: event.duration, toValue: 60,}),
			]).start();
		});
	}

	componentWillUnmount() {
		this.keyboardWillShowListener.remove();
		this.keyboardWillHideListener.remove();
	}

	render() {
		const { icon, title, footer, children } = this.props;
		return (
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{flex: 1}}
			>
				<Animated.ScrollView style={styles.container} keyboardShouldPersistTaps="always" contentContainerStyle={[styles.content, { paddingBottom: 0 }]}>

					{/*LOGO*/}
					{/*	{!this.state.keyboardVisible ? (*/}
					<View style={styles.header}>
						<AnimatedIcon name={icon} size={this.iconSize} color={'white'} />
						<Animated.Text style={[styles.headerText, { fontSize: this.fontSize, width: this.fontWidth }]}>{title}</Animated.Text>
					</View>

					{/*FORM*/}
					<View style={{...styles.view, marginVertical: 30, flexGrow: 2}}>
						{children}
					</View>

					{/*FOOTER*/}
					{footer && !this.state.keyboardVisible ? (
					<View style={{...styles.view, justifyContent: 'flex-end', marginBottom: 15}}>
						<Divider style={{marginVertical: 15, marginHorizontal: 30}}/>
						{footer}
					</View>
					) : null}

				</Animated.ScrollView>
			</KeyboardAvoidingView>
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
		paddingTop: 230,
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
