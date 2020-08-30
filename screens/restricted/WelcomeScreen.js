import React from 'react';
import { ScrollView, StyleSheet, Image, View, Dimensions } from "react-native";
import {Button, Divider, Text} from "react-native-elements";
import { THEME } from "@polymind/sdk-js";
import I18n from '../../locales/i18n';
import SocialLogin from "../../components/SocialLogin";

export default class WelcomeScreen extends React.Component {

	render() {
		const { navigation } = this.props;

		return (
			<View style={styles.container}>

				{/*LOGO*/}
				<View style={{flex: 0.20, justifyContent: 'center', alignItems: 'center', paddingTop: 15}}>
					<View style={styles.logoContainer}>
						<Image source={require('../../assets/images/polymind-dark.png')} style={{ width: 40, height: 46 }} />
						<Text style={styles.logoText}>Polymind</Text>
					</View>
				</View>

				{/*IMAGE*/}
				<View style={{flex: 0.5, marginVertical: 30, alignItems: 'center'}}>
					<Image source={require('../../assets/images/welcome.png')} style={{width: Dimensions.get('window').width * 0.8, height: Dimensions.get('window').height * 0.4}} />
				</View>

				<View style={{flex: 0.3, backgroundColor: THEME.primary, justifyContent: 'center', padding: 30 }}>
					<View style={{ flexDirection: 'row' }}>
						<View style={{ flex: 0.5, marginRight: 5, }}>
							<Button title={I18n.t("restricted.login")} type="solid" titleStyle={{ color: THEME.primary }} buttonStyle={{
								borderRadius: 6,
								height: 50,
								backgroundColor: 'white',
							}} onPress={() => navigation.push('Login')} />
						</View>
						<View style={{ flex: 0.5, marginLeft: 5, }}>
							<Button title={I18n.t("restricted.register")} type="outline" titleStyle={{ color: 'white' }} buttonStyle={{
								borderRadius: 6,
								// backgroundColor: THEME.secondary,
								borderColor: 'white',
								height: 50,
								borderWidth: 1,
							}} onPress={() => navigation.push('Register')} />
						</View>
					</View>


					<Divider style={{marginTop: 25, marginBottom: 15, marginHorizontal: 30, backgroundColor: 'rgba(255, 255, 255, 0.5)'}}/>
					<View style={{ flexDirection: 'row', marginTop: -25, justifyContent: 'center'}}>
						<Text style={{backgroundColor: THEME.primary, paddingHorizontal: 15, color: 'white'}}>{I18n.t('restricted.orLoginUsing')}</Text>
					</View>

					<SocialLogin style={{marginTop: 5}} />
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
		fontSize: 30,
		fontFamily: 'geomanist',
	},
	centeredText: {
		textAlign: 'center',
		color: 'white'
	},
});
