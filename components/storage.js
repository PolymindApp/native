import AsyncStorage from '@react-native-community/async-storage';

export default class Storage {

	static async get(key) {
		try {
			const jsonValue = await AsyncStorage.getItem(key);
			return jsonValue != null ? JSON.parse(jsonValue) : null;
		} catch(e) {
			return null;
		}
	}

	static async set(key, value) {
		try {
			const jsonValue = JSON.stringify(value);
			await AsyncStorage.setItem(key, jsonValue);
		} catch (e) {
			return null;
		}
	}
}
