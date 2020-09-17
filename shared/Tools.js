import React from 'react';
import SettingsContext, { SettingsContextInitialState } from "../contexts/SettingsContext";

export default {

	execute(action, props) {
		eval('this.' + action + '(props)');
	},

	resetSettings() {
		const [settingsState, setSettingsState] = React.useContext(SettingsContext);
		setSettingsState(SettingsContextInitialState);
	},
}
