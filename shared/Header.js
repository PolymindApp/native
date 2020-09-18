import * as React from 'react';
import { Platform } from 'react-native';
import { Appbar } from 'react-native-paper';

const Header = ({ scene, previous, navigation }) => {

	const { options } = scene.descriptor;
	const title =
		options.headerTitle !== undefined
			? options.headerTitle
			: options.title !== undefined
			? options.title
			: scene.route.name;

	return (
		<Appbar.Header style={{
			elevation: 0,
			height: Platform.OS === 'ios' ? 47 : 56,
		}}>
			{previous && <Appbar.BackAction
				onPress={() => navigation.pop()}
				color={'white'}
			/>}
			<Appbar.Content title={title} />

			{options.headerRight && options.headerRight()}
		</Appbar.Header>
	);
};

export default Header;
