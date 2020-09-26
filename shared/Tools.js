import React from 'react';
import SettingsContext, { SettingsContextInitialState } from "../contexts/SettingsContext";
import I18n from "../locales/i18n";
import { Alert } from "react-native";

export default {

	execute(action, props) {
		eval('this.' + action + '(props)');
	},

	resetSettings() {
		const [settingsState, setSettingsState] = React.useContext(SettingsContext);
		setSettingsState(SettingsContextInitialState);
	},

	leaveWarning(warn = true, callback = () => {}, btnTitle = I18n.t('btn.back')) {
		if (warn) {
			Alert.alert(I18n.t('alert.backDiffTitle'), I18n.t('alert.backDiffDesc'), [
				{ text: btnTitle, onPress: () => {
					callback();
				}, style: 'destructive' },
				{ text: I18n.t('btn.cancel'), style: "cancel" }
			], { cancelable: false });
		} else {
			callback();
		}
	},
}
