import React from 'react';
import { ScrollView, StyleSheet, Image, View, Dimensions } from "react-native";
import {Button, Text} from "react-native-elements";
import { THEME } from "@polymind/sdk-js";
import I18n from '../../locales/i18n';

export default class WelcomeScreen extends React.Component {

	render() {
		const { navigation } = this.props;
		return (
			<ScrollView style={styles.container} contentContainerStyle={styles.content}>

				{/*IMAGE*/}
				<View>
					<Image source={require('../../assets/images/welcome.jpg')} style={{width: Dimensions.get('window').width + 200, marginLeft: -100, height: Dimensions.get('window').height * 0.5 + 200, borderBottomLeftRadius: 250, borderBottomRightRadius: 250, opacity: 0.25, paddingTop: 200, marginTop: -200}} />
				</View>

				{/*LOGO*/}
				<View style={{...styles.view, flex: 0.4, justifyContent: 'center', alignItems: 'center', marginVertical: 15}}>
					<View style={styles.logoContainer}>
						<Image source={require('../../assets/images/polymind-light.png')} style={{ width: 60, height: 100 }} />
						<Text style={styles.logoText}>Polymind</Text>
					</View>
				</View>

				<View style={{flex: 0.6, marginHorizontal: 30 }}>
					<View>
						<Button title={I18n.t("restricted.login")} type="solid" buttonStyle={{
							borderRadius: 6,
							height: 50,
						}} onPress={() => navigation.push('Login')} />
					</View>
					<View style={{marginTop: 10}}>
						<Button title={I18n.t("restricted.register")} type="outline" titleStyle={{color: 'white'}} buttonStyle={{
							borderRadius: 6,
							height: 50,
							backgroundColor: THEME.third,//'rgba(255, 255, 255, 0.2)',
							borderColor: THEME.third,
							borderWidth: 1,
						}} onPress={() => navigation.push('Register')} />
					</View>
				</View>

			</ScrollView>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#0c3238',//THEME.primaryDarker
	},
	content: {
		flex: 1,
		justifyContent: 'center',
	},
	logoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	logoText: {
		color: 'white',
		marginLeft: 15,
		fontWeight: 'normal',
		fontSize: 40,
	},
	view: {
		marginHorizontal: 60,
	},
	centeredText: {
		textAlign: 'center',
		color: 'white'
	},
});
