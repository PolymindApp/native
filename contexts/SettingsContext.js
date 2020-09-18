import React from 'react';
import I18n from "../locales/i18n";

const SettingsContextInitialState = {
	fromLang: I18n.locale,
	toLang: I18n.locale === 'en' ? 'es' : 'en',
	recents: [],
	tips: {
		cardsIntro: true,
		translateExplanation: true,
	},
	cards: {
		autoFocus: false,
		hideHeaderOnFocus: false,
		showMicrophone: true,
		addCardConfirmation: true,
		didYouMean: true, //todo
		readWordOnAdd: false, //todo
		autoSelectOnAdd: false, //todo
		firstLetterUpperCase: false, //todo
		showLogo: true,
	},
	languageSelector: {
		currentLanguage: true,
		recentLanguages: true,
		premiumLanguages: true,
		otherLanguages: true,
		nativeForm: false,
		flags: true,
		autoFocusSearch: false,
	},
	filters: {

	},
};

export { SettingsContextInitialState }

const SettingsContext = React.createContext([{}, () => {}]);

export default SettingsContext;
