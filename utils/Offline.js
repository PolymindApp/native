import * as FileSystem from 'expo-file-system';

export default class Offline {

	static async getContent(name) {
		return Offline.hasFile(name).then(({uri, exists}) => {
			if (!exists) {
				return false;
			}
			return FileSystem.readAsStringAsync(uri, {
				encoding: FileSystem.EncodingType.Base64,
			});
		}).catch(err => console.log(err));
	}

	static async clearCache() {
		await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory).then(async names => {
			for (let i = 0; i < names.length; i++) {
				const name = names[i];
				const uri = FileSystem.cacheDirectory + name;
				await FileSystem.deleteAsync(uri);
				console.log('cleared', uri);
			}
		});
	}

	static async cacheFiles(items = [], force = false) {
		const results = [];
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			await Offline.cacheFile(item.name, item.url, force)
				.then(uri => results.push(uri))
				.catch(err => console.log(err));
		}
		return results;
	}

	static async cacheBase64(name, base64, force = false) {

		let uri = FileSystem.cacheDirectory + name;

		if (force) {
			await FileSystem.deleteAsync(uri);
		}

		const { exists } = await FileSystem.getInfoAsync(uri);

		if (!exists || force) {
			await FileSystem.writeAsStringAsync(uri, base64, {
				encoding: FileSystem.EncodingType.Base64,
			});
		}

		return uri;
	}

	static async cacheFile(name, url, force = false) {

		let uri = FileSystem.cacheDirectory + name;

		if (force) {
			await FileSystem.deleteAsync(uri);
		}

		const { exists } = await FileSystem.getInfoAsync(uri);

		if (!exists || force) {
			const downloadResumable = FileSystem.createDownloadResumable(url, uri);
			const downloadResult = await downloadResumable.downloadAsync();

			if (downloadResult.status !== 200) {
				await FileSystem.deleteAsync(uri);
				console.log(downloadResult);
				throw new Error('error while downloading file');
			}
		}

		return uri;
	}

	static async hasFile(name) {
		const uri = FileSystem.cacheDirectory + name;
		const { exists } = await FileSystem.getInfoAsync(uri);
		return { uri, exists }
	}
}
