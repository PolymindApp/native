import React from 'react'
import {Keyboard, Platform, StyleSheet, View} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PolymindSDK, { User, Helpers, UserService } from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';
import {Divider, ListItem} from "react-native-elements";
import {Button, Switch} from "react-native-paper";

const $polymind = new PolymindSDK();

export default class SettingsScreen extends React.Component {

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
			settings: user.settings,
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
		return JSON.stringify(this.state.user.settings) !== JSON.stringify(this.state.original.settings);
	}

	render() {
		return (
			<View style={{flex: 1}}>
				<ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>
					<View style={{marginHorizontal: 10, marginTop: 15, borderRadius: 10, padding: 5, backgroundColor: 'white'}}>
						<ListItem
							checkBox={{ checked: this.state.user.settings.theme === 'dark' }}
							title={I18n.t('field.settings.darkMode')}
							delayPressIn={0}
							onPress={() => {
								const user = this.state.user;
								user.settings.theme = user.settings.theme === 'light' ? 'dark' : 'light';
								this.setState({ user });
							}}
						/>
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
	}
});
