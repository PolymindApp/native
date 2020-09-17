import React from 'react';
import Icon from './Icon';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import { theme } from '../theme';

export default function Warning({ icon, text, style, rounded, ...rest }) {
	return (
		<View style={[styles.inner, {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: theme.colors.warning,
			borderRadius: rounded ? 3 : 0,
		}, style]} {...rest}>
			{icon && <Icon name={icon} style={{ color: 'white', marginRight: 10 }} size={24} />}
			<Text style={{
				color: 'white'
			}}>{text}</Text>
		</View>
	)
}
