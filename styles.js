import { StyleSheet, Dimensions } from "react-native";
import { theme } from './theme';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	horizontal: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	vertical: {
		flexDirection: 'column',
		justifyContent: 'center',
	},
	middle: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	halfWidth: {
		maxWidth: Dimensions.get('window').width / 2,
	},
	center: {
		textAlign: 'center',
	},
	min: {
		flex: 0,
	},
	max: {
		flex: 1,
	},
	inner: {
		padding: 10,
	},
	innerX: {
		paddingLeft: 5,
		paddingRight: 5,
	},
	pushVertical: {
		marginVertical: 10
	},
	title: {
		fontWeight: 'bold',
		fontSize: 16,
	},
	small: {
		fontSize: 10,
	},
	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
	},
	fabCentered: {
		position: 'absolute',
		margin: 16,
		left: Dimensions.get('window').width / 2 - 44,
		bottom: 8,
		backgroundColor: theme.colors.primary,
	},
	primaryText: {
		color: theme.colors.primary,
	},
	transparentText: {
		color: 'rgba(0, 0, 0, .5)',
	},
	sheet: {
		backgroundColor: 'white',
	},
	sheet2: {
		backgroundColor: 'rgba(0, 0, 0, 0.05)',
	},
	noRadius: {
		borderRadius: 0,
	},
	elevated: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 2,
	},
});
