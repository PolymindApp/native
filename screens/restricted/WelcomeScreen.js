import React from 'react';
import { ScrollView, StyleSheet, Image, View, Dimensions } from "react-native";
import {Button, Text} from "react-native-elements";
import { THEME } from "@polymind/sdk-js";
import I18n from '../../locales/i18n';

export default class WelcomeScreen extends React.Component {

	render() {
		const { navigation } = this.props;
		return (
			<View style={styles.container}>

				{/*LOGO*/}
				<View style={{flex: 0.25, justifyContent: 'center', alignItems: 'center', paddingTop: 15}}>
					<View style={styles.logoContainer}>
						<Image source={require('../../assets/images/polymind-dark.png')} style={{ width: 60, height: 100 }} />
						<Text style={styles.logoText}>Polymind</Text>
					</View>
				</View>

				{/*IMAGE*/}
				<View style={{flex: 0.5, marginVertical: 30}}>
					<Image source={require('../../assets/images/welcome.png')} style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.4}} />
				</View>

				<View style={{flex: 0.25, backgroundColor: THEME.primary, justifyContent: 'center', padding: 30 }}>
					<View>
						<Button title={I18n.t("restricted.login")} type="solid" titleStyle={{ color: THEME.primary }} buttonStyle={{
							borderRadius: 6,
							height: 50,
							backgroundColor: 'white',
						}} onPress={() => navigation.push('Login')} />
					</View>
					<View style={{marginTop: 10}}>
						<Button title={I18n.t("restricted.register")} type="outline" titleStyle={{ color: 'white' }} buttonStyle={{
							borderRadius: 6,
							// backgroundColor: THEME.secondary,
							borderColor: 'white',
							height: 50,
							borderWidth: 1,
						}} onPress={() => navigation.push('Register')} />
					</View>
				</View>

			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f1f0',
	},
	logoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	logoText: {
		color: '#1B8E8A',
		marginLeft: 15,
		fontWeight: '200',
		fontSize: 40,
	},
	centeredText: {
		textAlign: 'center',
		color: 'white'
	},
});
