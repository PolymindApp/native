import React from "react";
import I18n from '../../locales/i18n';
import { HeaderBackButton } from "@react-navigation/stack";

export default class BackButton extends React.Component {

	render() {
		const { label, ...rest } = this.props;

		return (
			<HeaderBackButton label={I18n.t('btn.back')} tintColor={'white'} {...rest} />
		)
	}
}
