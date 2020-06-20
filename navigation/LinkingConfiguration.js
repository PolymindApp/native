import * as Linking from 'expo-linking';

export default {
	prefixes: [Linking.makeUrl('/'), 'polymind://', 'https://client.polymind.app/_u/'],
	config: {
		ResetPassword: {
			path: 'reset-password/:token',
			parse: {
				id: String,
			},
		},
		VerifyEmail: {
			path: 'verify-email/:token/:external_id',
			parse: {
				id: String,
				external_id: String,
			},
		},
	},
};
