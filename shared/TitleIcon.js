import React from 'react';
import Icon from "../shared/Icon";
import { small, styles } from "../styles";
import { Title } from "react-native-paper";
import { View } from "react-native";

export default function TitleIcon({ icon, children, style, titleStyle, iconStyle, ...rest }) {
	return <View style={[styles.horizontal, style]} {...rest}>
		<Icon name={icon} size={24} style={[{ marginRight: small }, iconStyle]} />
		<Title style={titleStyle}>{children}</Title>
	</View>
}
