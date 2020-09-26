import React from 'react';
import Icon from "../../../shared/Icon";
import { Linking, View } from "react-native";
import { Button, Divider } from "react-native-paper";
import { styles, medium } from "../../../styles";

export default function SettingsSocial(props) {

	const buttons = [
		{ title: 'Facebook', icon: 'facebook', color: '#3C66C4', href: 'https://www.facebook.com/polymindapp', },
		{ title: 'Twitter', icon: 'twitter', color: '#00ACEE', href: 'https://twitter.com/polymindapp', },
		{ title: 'LinkedIn', icon: 'linkedin', color: '#0E76A8', href: 'https://www.linkedin.com/company/polymindapp', },
	];

	return <View>
		<View style={[styles.horizontal, styles.middle, {
			justifyContent: 'space-evenly'
		}]}>
			{buttons.map((button, buttonIdx) =>
				<Button
					key={buttonIdx}
					color={button.color}
					style={{
						borderRadius: 1000,
					}}
					onPress={() => Linking.openURL(button.href)}
					mode={'contained'}
				>
					<Icon name={button.icon} size={24} color={'white'} />
				</Button>
			)}
		</View>
		<Divider style={{ marginVertical: medium }} />
		<Button onPress={() => Linking.openURL('https://www.polymind.app')}>
			Visit our website
		</Button>
	</View>
}
