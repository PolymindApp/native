import React from 'react';
import {Keyboard, KeyboardAvoidingView, Platform, Text, Easing, StyleSheet, Animated, View, ScrollView} from "react-native";
import { Divider, Icon} from "react-native-elements";
import { THEME } from "@polymind/sdk-js";

// const AnimatedIcon = Animated.createAnimatedComponent(Icon);

export default class ClassicForm extends React.Component {

	animatedValue = new Animated.Value(0);
	animatedValueNative = new Animated.Value(0);

	state = {
		keyboardVisible: false,
	}

	componentDidMount() {
		this.keyboardWillShowListener = Keyboard.addListener("keyboardWillShow", event => {
			Animated.parallel([
				Animated.timing(this.animatedValue, {useNativeDriver: false, toValue: 1, duration: event.duration, easing: Easing.ease}),
				Animated.timing(this.animatedValueNative, {useNativeDriver: false, toValue: 1, duration: event.duration, easing: Easing.ease})
			]).start();
			this.setState({ keyboardVisible: true });
		});
		this.keyboardWillHideListener = Keyboard.addListener("keyboardWillHide", event => {
			Animated.parallel([
				Animated.timing(this.animatedValue, {useNativeDriver: false, toValue: 0, duration: event.duration, easing: Easing.ease}),
				Animated.timing(this.animatedValueNative, {useNativeDriver: false, toValue: 0, duration: event.duration, easing: Easing.ease})
			]).start();
			this.setState({ keyboardVisible: false });
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
				style={{flex: 0}}
			>
				<ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingBottom: 0 }]}>

					{/*LOGO*/}
					<Animated.View style={[styles.header, {
						marginBottom: this.animatedValue.interpolate({
							inputRange: [0, 1],
							outputRange: [0, -100]
						}),
						transform: [{
							scale: this.animatedValueNative.interpolate({
								inputRange: [0, 1],
								outputRange: [1, 0.5]
							})
						}],
					}]}>
						<Icon name={icon} size={48} color={'rgba(255, 255, 255, 0.5)'} />
						<Text style={styles.headerText}>{title}</Text>
					</Animated.View>

					{/*FORM*/}
					<View style={{...styles.view, marginVertical: 30, flex: 1}}>
						{children}
					</View>

					{/*FOOTER*/}
					{footer &&
					<View style={{...styles.view, justifyContent: 'flex-end', marginBottom: 15}}>
						<Divider style={{marginVertical: 15, marginHorizontal: 30}}/>
						{footer}
					</View>}

				</ScrollView>
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
		marginTop: -200,
		marginBottom: 0,
		paddingTop: 230,
		paddingBottom: 30,
		paddingHorizontal: 10060,
		marginHorizontal: -10000,
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
