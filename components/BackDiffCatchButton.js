import React from "react";
import {Alert} from "react-native";
import I18n from "../locales/i18n";
import {HeaderBackButton} from "@react-navigation/stack";

export default class BackDiffCatchButton extends React.Component {

	render() {
		const { hasDifferences, callback, ...rest } = this.props;

		return (
			<HeaderBackButton tintColor={'white'} {...rest} onPress={() => {
				if (!hasDifferences()) {
					callback();
				} else {
					Alert.alert(I18n.t('alert.backDiffTitle'), I18n.t('alert.backDiffDesc'), [
						{ text: I18n.t('btn.back'), onPress: () => {
							callback();
						}, style: 'destructive' },
						{ text: I18n.t('btn.cancel'), style: "cancel" }
					], { cancelable: false });
				}
			}} />
		)
	}
}
