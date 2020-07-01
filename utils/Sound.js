import Offline from "./Offline";
import {Audio} from "expo-av";

export default class Sound {

	static async play(name, url, group = 'default') {
		return Offline.hasFile(name).then(async ({exists, uri}) => {
			return await Audio.Sound.createAsync(
				{ uri: exists ? uri : url },
				{ shouldPlay: true }
			).then((res) => {
				res.sound.setOnPlaybackStatusUpdate((status)=>{
					if (!status.didJustFinish) {
						return;
					}
					res.sound.unloadAsync().catch((err) => console.log('unload.error', err));
				});
				return res;
			}).catch((error) => {
				switch (error.code) {
					case 'ABI37_0_0EXAV': // Corrupted memory.. try to recreate and read from remote URL meanwhile..
						Audio.Sound.createAsync(
							{ uri: url },
							{ shouldPlay: true }
						);
						Offline.cacheFile(name, url, true);
						break;
					default:
						console.error(error.code);
						break;
				}
			});
		});
	}
}
