import * as Linking from 'expo-linking';

export default {
	prefixes: [Linking.makeUrl('/'), 'polymind://', 'https://client.polymind.app/_u/'],
	config: {
		SessionsPlayer: {
			path: 'session/:hash',
			parse: {
				hash: String,
			},
		},
		Sessions: { // Both root+child required.. (see why later..)
			screens: {
				SessionsPlayer: {
					path: 'session/:hash',
					parse: {
						hash: String,
					},
				}
			},
		},
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
