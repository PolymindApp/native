import React from 'react';
import { Linking, Text } from 'react-native';
import { styles } from '../styles';

export default function Link({children, href, onPress, ...rest}) {
	return <Text style={styles.link} onPress={onPress ? onPress : () => {
		Linking.openURL(href);
	}}>
		{children}
	</Text>
}
