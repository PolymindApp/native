import React from 'react'
import {Platform, StyleSheet, Text, View, Keyboard} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PolymindSDK, { THEME, User, Helpers, UserService } from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';
import {Divider, Input} from "react-native-elements";
import {Button} from "react-native-paper";

const $polymind = new PolymindSDK();
const refInputs = [
	React.createRef(),
	React.createRef(),
	React.createRef(),
];

export default class InformationsScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			saving: false,
			user: props.route.params.user,
			original: new User(Helpers.deepClone(props.route.params.user)),
		};
	}

	save() {
		const user = this.state.user;
		this.setState({ saving: true });
		UserService.update(user.id, {
			screen_name: user.screen_name,
			biography: user.biography,
			quote: user.quote,
		})
			.then(() => {
				this.updateOriginal();
				this.props.navigation.pop();
			})
			.catch(err => {
				console.log(err);
			})
			.finally(() => this.setState({ saving: false }))
	}

	updateOriginal() {
		this.props.route.params.profileContext.setState({ me: this.state.user})
		return this.setState({ original: new User(Helpers.deepClone(this.state.user)) });
	}

	hasDifferences() {
		return JSON.stringify(this.state.user) !== JSON.stringify(this.state.original);
	}

	render() {
		return (
			<View style={{flex: 1, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0, 0, 0, 0.075)'}}>
				<ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>
					<View style={{marginHorizontal: 10, marginTop: 15, borderRadius: 10, padding: 5, paddingTop: 15, paddingBottom: 0, backgroundColor: 'white'}}>
						<Input
							label={I18n.t('field.user.screen_name')}
							inputStyle={{color:THEME.primary}}
							inputContainerStyle={{borderBottomWidth: 0}}
							defaultValue={this.state.user.screen_name}
							onChangeText={value => this.setState({ user: {...this.state.user, screen_name: value}})}
							returnKeyType = {"next"}
							renderErrorMessage={false}
							ref={ref => { refInputs[0] = ref }}
							onSubmitEditing={() => refInputs[1].focus()}
						/>

						<Text style={styles.desc}>{I18n.t('profile.information.completeNameDesc')}</Text>
					</View>
					<View style={{marginHorizontal: 10, marginTop: 15, borderRadius: 10, padding: 5, paddingTop: 15, paddingBottom: 0, backgroundColor: 'white'}}>
						<Input
							label={I18n.t('field.user.biography')}
							inputStyle={{color:THEME.primary}}
							inputContainerStyle={{borderBottomWidth: 0}}
							defaultValue={this.state.user.biography}
							onChangeText={value => this.setState({ user: {...this.state.user, biography: value}})}
							multiline={true}
							returnKeyType = {"next"}
							renderErrorMessage={false}
							ref={ref => { refInputs[1] = ref }}
						/>

						<Text style={styles.desc}>{I18n.t('profile.information.biographyDesc')}</Text>
					</View>
					<View style={{marginHorizontal: 10, marginTop: 15, borderRadius: 10, padding: 5, paddingTop: 15, paddingBottom: 0, backgroundColor: 'white'}}>
						<Input
							label={I18n.t('field.user.quote')}
							inputStyle={{color:THEME.primary}}
							inputContainerStyle={{borderBottomWidth: 0}}
							defaultValue={this.state.user.quote}
							onChangeText={value => this.setState({ user: {...this.state.user, quote: value}})}
							multiline={true}
							numberOfLines={2}
							returnKeyType = {"done"}
							renderErrorMessage={false}
							ref={ref => { refInputs[2] = ref }}
							onSubmitEditing={Keyboard.dismiss}
						/>

						<Text style={styles.desc}>{I18n.t('profile.information.quoteDesc')}</Text>
					</View>
				</ScrollView>
				<View style={{flex: 0, marginHorizontal: 10, marginBottom: 10}}>
					<Divider style={{marginBottom: 10}} />
					<Button mode="contained" onPress={() => this.save()} loading={this.state.saving} disabled={!this.hasDifferences() || this.state.saving}>
						{I18n.t('btn.save')}
					</Button>
				</View>
			</View>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	desc: {
		margin: 10,
		marginTop: 0,
		color: 'rgba(0, 0, 0, 0.33)',
		fontSize: 12,
	}
});
