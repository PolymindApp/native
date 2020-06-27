import * as FileSystem from 'expo-file-system';

export default class Offline {

	static async cacheVoices(voices, force = false) {
		let results = {};
		for (let i = 0; i < voices.length; i++) {
			const voice = await this.cacheVoice(voices[i], force);
			results[voice.locale + '_' + voice.text] = voice;
		}
		return results;
	}

	static async cacheVoice(voice, force = false) {

		const fileUri = FileSystem.cacheDirectory + voice.file_name;

		if (force) {
			await FileSystem.deleteAsync(fileUri);
			console.log('deleted from memory', fileUri);
		}

		const { exists } = await FileSystem.getInfoAsync(fileUri);

		if (!exists) {
			const downloadResumable = FileSystem.createDownloadResumable(voice.file_url, fileUri);
			await downloadResumable.downloadAsync();
			console.log('downloaded', voice.file_url, fileUri);
		}

		voice.file_uri = fileUri;

		return voice;
	}

	static async cacheSounds(sounds, force = false) {
		let results = {};
		const keys = Object.keys(sounds);
		for (let i = 0; i < keys.length; i++) {
			const name = keys[i];
			const url = sounds[name];
			const parts = url.split('/');
			const fileName = parts[parts.length - 1];
			const fileUri = FileSystem.cacheDirectory + fileName;

			const { exists } = await FileSystem.getInfoAsync(fileUri);
			if (!exists || force) {
				const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
				await downloadResumable.downloadAsync();
			}
			results[name] = fileUri
		}
		return results;
	}
}
