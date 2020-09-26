import Hash from './Hash';

export default class Color {

	static randomHex() {
		return Math.floor(Math.random()*16777215).toString(16);
	}

	static stringToHex(string) {
		const hash = Hash.fromString(string);
		return Color.hashToRgba(hash);
	}

	static hashToRgba(hash) {

		let hex = ((hash>>24)&0xFF).toString(16) +
			((hash>>16)&0xFF).toString(16) +
			((hash>>8)&0xFF).toString(16) +
			(hash&0xFF).toString(16);

		// Sometimes the string returned will be too short so we
		// add zeros to pad it out, which later get removed if
		// the length is greater than six.
		hex += '000000';
		return hex.substring(0, 6);
	}

	static isDark(hex) {
		let rgb = parseInt(hex, 16); // convert rrggbb to decimal
		let r = (rgb >> 16) & 0xff; // extract red
		let g = (rgb >> 8) & 0xff; // extract green
		let b = (rgb >> 0) & 0xff; // extract bluelet
		let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
		return luma < 150;
	}
}
