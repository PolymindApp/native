import { pollyVoices } from './Constants';

/**
 * Uses API Gateway
 */
const baseUrl = 'https://86wcx8wx58.execute-api.ca-central-1.amazonaws.com/v1/';

export default class Services {

	/**
	 * Doc: https://dev.cognitive.microsoft.com/docs/services/5f7d486e04d2430193e1ca8f760cd7ed/operations/57855119bca1df1c647bc358
	 *
	 * @param text
	 * @param locale
	 * @returns {Promise<Object>}
	 */
	static spellCheck(text, locale = 'en-us') {
		return fetch(baseUrl + '/spellcheck?text=' + encodeURIComponent(text) + '&locale=' + locale.toLowerCase())
			.then(response => response.json())
			.then(response => {

				response.formatted = false;

				const tokens = response.flaggedTokens;

				if (!tokens) {
					return response;
				}

				let offset = 0;
				const item = {
					original: text,
					suggestion: '',
					parts: [],
				};
				tokens.forEach((token, tokenIdx) => {
					const suggestion = token.suggestions[0].suggestion;
					const start = token.offset;
					const end = start + token.token.length;

					if (start > offset) {
						const rest = text.substring(offset, start);
						item.suggestion += rest;
						item.parts.push(rest);
					}

					item.suggestion += suggestion;
					item.parts.push(suggestion);
					offset = end;
				});

				if (offset < text.length) {
					const rest = text.substring(offset);
					item.suggestion += rest;
					item.parts.push(rest);
				}

				response.formatted = item;
				return response;
			});
	}

	/**
	 * Doc: https://cloud.google.com/translate/docs/reference/rest
	 *
	 * @param text
	 * @param from
	 * @param to
	 * @returns {Promise<Object>}
	 */
	static translate(text, from, to) {

		if (!Array.isArray(to)) {
			to = [to];
		}

		return fetch(baseUrl + '/translate?text=' + encodeURIComponent(text) + '&from=' + from + '&to=' + to.join(','))
			.then(response => response.json());
	}

	/**
	 * Doc: https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list
	 *
	 * @param query
	 * @param locale
	 * @returns {Promise<Object>}
	 */
	static fetchImages(query, locale) {
		return fetch(baseUrl + '/images?query=' + encodeURIComponent(query) + '&locale=' + locale)
			.then(response => response.json());
	}

	/**
	 * Get synthetic voice data stream
	 *
	 * @param text
	 * @param locale
	 * @param voiceId
	 */
	static getVoiceDataStream(text, locale = 'en', voice = null) {

		const polly = pollyVoices.find(voice => {
			if (!voice) {
				return voice.default && voice.locale.startsWith(locale);
			} else {
				return voice.name.toLowerCase() === (voice || '').toLowerCase();
			}
		});

		return fetch(baseUrl + '/voice/stream?text=' + encodeURIComponent(text) + '&locale=' + polly.locale + '&voice=' + polly.voice)
			.then(response => response.blob());
	}

	/**
	 * @param type
	 * @param from
	 * @param subject
	 * @param message
	 * @param includeCopy
	 */
	static sendEmail(type = 'default', from, subject, message, includeCopy = false) {
		return fetch(baseUrl + '/feedback', {
			method: 'POST',
			body: {
				type,
				from,
				subject,
				message,
				includeCopy,
			}
		})
			.then(response => response.json());
	}
}
