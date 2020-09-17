import React from "react";
import I18n from "../locales/i18n";
import { ActionSheetIOS, Platform, TouchableOpacity, Text } from "react-native";
import { IconButton, Menu } from "react-native-paper";

export default class Contextual extends React.Component {

	state = {
		menu: false,
	}

	showIOSOptions(items) {

		const iosItems = items.filter(item => item.ios !== false);
		const texts = iosItems.map(item => item.name);
		const destructiveButtonIndex = iosItems.findIndex(item => item.destructive);
		const cancelButtonIndex = iosItems.findIndex(item => item.cancel);

		this.props.onOpen && this.props.onOpen();

		ActionSheetIOS.showActionSheetWithOptions({
			options: texts,
			destructiveButtonIndex,
			cancelButtonIndex
		}, buttonIndex => {
			this.props.onClose && this.props.onClose();
			items[buttonIndex].callback();
		});
	}

	render() {

		const { items, disabled } = this.props;

		return Platform.select({
			ios: (
				<TouchableOpacity hitSlop={{top: 20, left: 20, bottom: 20, right: 20}} style={{flexDirection: 'row', alignItems: 'center', marginRight: 10, }} onPress={() => this.showIOSOptions(items)} disabled={disabled}>
					<Text style={{color: 'white'}}>{I18n.t('btn.options')}</Text>
				</TouchableOpacity>
			),
			default: (
				<Menu
					visible={this.state.menu}
					onDismiss={() => {
						this.props.onClose && this.props.onClose();
						this.setState({ menu: false });
					}}
					anchor={
						<IconButton onPress={() => this.setState({ menu: true })} icon="dots-vertical" color={'white'} disabled={disabled} />
					}
				>
					{items.filter(item => item.android !== false).map((item, itemIdx) => (
						<Menu.Item key={itemIdx} onPress={() => {
							this.props.onOpen && this.props.onOpen();
							item.callback();
							this.setState({ menu: false });
						}} title={item.name} icon={item.icon} />
					))}
				</Menu>
			),
		});
	}
}
