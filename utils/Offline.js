import * as FileSystem from 'expo-file-system';

export default class Offline {

	static async cacheVoices(voices) {
		let results = {};
		for (let i = 0; i < voices.length; i++) {
			const voice = voices[i];
			const fileUri = FileSystem.cacheDirectory + voice.file_name;

			const { exists } = await FileSystem.getInfoAsync(fileUri);
			if (!exists) {
				const downloadResumable = FileSystem.createDownloadResumable(voice.file_url, fileUri);
				await downloadResumable.downloadAsync();
			}
			voice.file_uri = fileUri;
			results[voice.locale + '_' + voice.text] = fileUri;
		}
		return results;
	}

	static async cacheSounds(sounds) {
		let results = {};
		const keys = Object.keys(sounds);
		for (let i = 0; i < keys.length; i++) {
			const name = keys[i];
			const url = sounds[name];
			const parts = url.split('/');
			const fileName = parts[parts.length - 1];
			const fileUri = FileSystem.cacheDirectory + fileName;

			const { exists } = await FileSystem.getInfoAsync(fileUri);
			if (!exists) {
				const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
				await downloadResumable.downloadAsync();
			}
			results[name] = fileUri
		}
		return results;
	}
}
