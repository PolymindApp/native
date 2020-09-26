export default class Helpers {

	static getQueryParams(param) {
		return new URLSearchParams(document.location.search).get(param);
	}

	static slug(str) {
		return str.toLowerCase()
			.replace(/ /g,'-')
			.replace(/[^\w-]+/g,'');
	}

	static deepClone(obj) {
		return JSON.parse(JSON.stringify(obj));
	}
}
