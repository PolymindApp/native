import React from 'react'
import {Keyboard, Platform, StyleSheet, View} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PolymindSDK, { User, Helpers } from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';
import {Divider, Icon, Input, ListItem, Text} from "react-native-elements";
import {Button, Switch} from "react-native-paper";

const $polymind = new PolymindSDK();

export default class SettingsScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			settings: props.route.params.user.settings,
			original: new User(Helpers.deepClone(props.route.params.user.settings)),
		};
	}

	hasDifferences() {
		return JSON.stringify(this.state.user) !== JSON.stringify(this.state.original);
	}

	render() {
		return (
			<View style={{flex: 1}}>
				<ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>
					<View style={{marginHorizontal: 10, marginTop: 15, borderRadius: 10, padding: 5, backgroundColor: 'white'}}>
						<ListItem
							rightElement={<Switch
								value={this.state.settings.theme === 'dark'}
							/>}
							title={I18n.t('field.settings.darkMode')}
							delayPressIn={0}
							onPress={() => {
								const settings = this.state.settings;
								settings.theme = settings.theme === 'light' ? 'dark' : 'light';
								this.setState({ settings });
							}}
						/>
					</View>
				</ScrollView>
				<View style={{flex: 0, marginHorizontal: 10, marginBottom: 10}}>
					<Divider style={{marginBottom: 10}} />
					<Button mode="contained" onPress={() => this.save()} disabled={!this.hasDifferences()}>
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
