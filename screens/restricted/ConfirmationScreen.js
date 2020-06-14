import React from 'react';
import {ScrollView, StyleSheet, View, Keyboard} from "react-native";
import {Button, Divider, Icon, Text} from "react-native-elements";
import I18n from '../../locales/i18n';
import { THEME } from '@polymind/sdk-js';

export default class RegisterScreen extends React.Component {

	render() {
		const { route, navigation } = this.props;
		return (
			<ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps={'handled'}>

				<View style={{flex: 1, justifyContent: 'center', paddingHorizontal: 60}}>
					<Icon name={route.params?.icon} size={90} color={'white'} />
					<Text style={styles.centeredText} h4>{route.params?.title}</Text>
					<Text style={styles.centeredText}>{route.params?.subtitle}</Text>
				</View>

				{/*FOOTER*/}
				<View style={{...styles.view, justifyContent: 'flex-end', marginBottom: 30}}>
					<Divider style={{marginVertical: 15, marginHorizontal: 30, backgroundColor: 'white', opacity: 0.25}} />
					<Button
						title={route.params?.footerTitle}
						type="clear"
						titleStyle={{color: 'white'}}
						onPress={() => navigation.navigate(route.params?.footerNavigation)}
					/>
				</View>
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
		backgroundColor: THEME.primary,
	},
	view: {
		marginHorizontal: 30,
		justifyContent: 'center',
	},
	centeredText: {
		textAlign: 'center',
		color: 'white',
	},
});
