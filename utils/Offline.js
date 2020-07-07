import * as FileSystem from 'expo-file-system';

export default class Offline {

	static async cacheFiles(items = [], force = false) {
		const results = [];
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const uri = await Offline.cacheFile(item.name, item.url, force);
			results.push(uri);
		}
		return results;
	}

	static async cacheFile(name, url, force = false) {

		const uri = FileSystem.cacheDirectory + name;

		if (force) {
			await FileSystem.deleteAsync(uri);
		}

		const { exists } = await FileSystem.getInfoAsync(uri);

		if (!exists || force) {
			const downloadResumable = FileSystem.createDownloadResumable(url, uri);
			await downloadResumable.downloadAsync();
		}

		return uri;
	}

	static async hasFile(name) {
		const uri = FileSystem.cacheDirectory + name;
		const { exists } = await FileSystem.getInfoAsync(uri);
		return { uri, exists }
	}
}
