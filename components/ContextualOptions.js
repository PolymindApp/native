import {ActionSheetIOS, Platform, TouchableOpacity} from "react-native";
import {Text} from "react-native-elements";
import I18n from "../locales/i18n";
import {IconButton, Menu} from "react-native-paper";
import React from "react";
import { THEME } from '@polymind/sdk-js';

export default class ContextualOptions extends React.Component {

	state = {
		menu: false,
	}

	showIOSOptions(items) {
		const iosItems = items.filter(item => item.ios !== false);
		const texts = iosItems.map(item => item.name);
		const destructiveButtonIndex = iosItems.findIndex(item => item.destructive);
		const cancelButtonIndex = iosItems.findIndex(item => item.cancel);

		ActionSheetIOS.showActionSheetWithOptions({
			options: texts,
			destructiveButtonIndex,
			cancelButtonIndex
		}, buttonIndex => {
			items[buttonIndex].callback();
		});
	}

	render() {

		const { items, disabled } = this.props;

		return Platform.select({
			ios: (
				<TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => this.showIOSOptions(items)} disabled={disabled}>
					<Text style={{color: 'white'}}>{I18n.t('btn.options')}</Text>
				</TouchableOpacity>
			),
			default: (
				<Menu
					visible={this.state.menu}
					onDismiss={() => this.setState({ menu: false })}
					anchor={
						<IconButton onPress={() => this.setState({ menu: true })} icon="dots-vertical" color={'white'} disabled={disabled}></IconButton>
					}
				>
					{items.filter(item => item.android !== false).map((item, itemIdx) => (
						<Menu.Item key={itemIdx} onPress={() => {
							item.callback();
							this.setState({ menu: false });
						}} title={item.name} icon={item.icon} />
					))}
				</Menu>
			),
		});
	}
}
