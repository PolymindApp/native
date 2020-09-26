import React from 'react';
import I18n from "../locales/i18n";

const SettingsContextInitialState = {
	locale: 'fr',
	fromLang: I18n.locale,
	toLang: I18n.locale === 'en' ? 'es' : 'en',
	recents: [],
	tips: {
		cardsIntro: true,
		filtersIntro: true, //todo
		translateExplanation: true,
		wordTagsExplanation: true, //todo
		sessionsExplanation: true,
		sessionExplanation: true,
	},
	cards: {
		autoFocus: false,
		hideHeaderOnFocus: false,
		showMicrophone: true,
		addCardConfirmation: true,
		didYouMean: true, //todo
		readWordOnAdd: false, //todo
		autoSelectOnAdd: false, //todo
		gotoSettingsOnAdd: false,
		firstLetterUpperCase: false, //todo
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
	card: {
		showFlag: true, //todo
		showSpeakButton: true, //todo
		allowNewTag: true, //todo
		addNewOnSave: false, //todo
	},
	filters: {
		sortAttr: 'date',
		sortOrder: 'desc',
		tags: [],
		difficulties: [],
		archived: false,
	},
};

export { SettingsContextInitialState }

const SettingsContext = React.createContext([{}, () => {}]);

export default SettingsContext;
