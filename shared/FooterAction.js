import React from 'react';
import { View } from 'react-native';
import { Divider } from 'react-native-paper';
import { styles } from '../styles';

export default function FooterAction({children}) {

	return (
		<View style={[styles.min, { backgroundColor: 'white' }]}>
			<Divider />
			{children}
		</View>
	)
}
