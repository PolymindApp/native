import React from 'react'
import {Alert, StyleSheet, Text, View} from 'react-native';
import Offline from "../../../utils/Offline";
import I18n from "../../../locales/i18n";
import {Button} from "react-native-paper";
import { THEME } from "@polymind/sdk-js";
import {ListItem} from "react-native-elements";

export default class ToolsScreen extends React.Component {

	state = {
		clearingCache: false,
	};

	async clearCache(force = false) {
		if (force) {
			this.setState({ clearingCache: true });
			await Offline.clearCache();
			this.setState({ clearingCache: false });
		} else {
			Alert.alert(I18n.t('alert.clearCacheTitle'), I18n.t('alert.clearCacheDesc'), [
				{ text: I18n.t('btn.clearCache'), onPress: () => {
						this.clearCache(true);
					}, style: 'destructive' },
				{ text: I18n.t('btn.cancel'), style: "cancel" }
			], { cancelable: false });
		}
	}

	render() {
		return (
			<View style={{flex: 1, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0, 0, 0, 0.075)'}}>
				<View style={{marginTop: 15}}>
					<View style={{marginHorizontal: 10, padding: 10, backgroundColor: 'white', borderRadius: 10}}>
						<Button mode={'outlined'} color={THEME.error} style={{ borderColor: THEME.error }} icon={'delete'} style={{margin: 10}} onPress={() => this.clearCache()} disabled={this.state.clearingCache} loading={this.state.clearingCache}>
							{I18n.t('btn.clearCache')}
						</Button>

						<Text style={styles.desc}>{I18n.t('profile.clearCacheDesc')}</Text>
					</View>
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
