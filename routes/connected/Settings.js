import React from 'react';
import SettingsHierarchy from '../../shared/SettingsHierarchy';
import Page from "./Page";

const sections = [
	{ type: 'group', title: 'Options', childs: [
		{ type: 'section', name: 'Translate', title: 'Translate', childs: [
			{ type: 'group', title: 'General', childs: [
				{ type: 'switch', title: 'Autofocus', desc: 'Save one action by auto focusing in the search field when opening the translate tab.', setting: 'cards.autoFocus' },
				{ type: 'switch', title: 'Did you mean?', desc: 'Check if current word has been entered properly.', setting: 'cards.didYouMean' },
				{ type: 'switch', title: 'Auto-select card', desc: 'Newly added cards will be selected automatically.', setting: 'cards.autoSelectOnAdd' },
				{ type: 'switch', title: 'Read newly add word', desc: 'Automatically read newly added word using a synthetic voice if possible.', setting: 'cards.readWordOnAdd' },
				{ type: 'switch', title: 'First character uppercase', desc: 'Will convert the first character of each card uppercase.', setting: 'cards.firstLetterUpperCase' },
			] },
			{ type: 'group', title: 'Features', childs: [
				{ type: 'switch', title: 'Speech Recognition', desc: 'A button to record voice will appear in the middle bottom of the screen.', setting: 'cards.showMicrophone' },
			] },
			{ type: 'group', title: 'Accessibility', childs: [
				{ type: 'switch', title: 'New card confirmation cue', desc: 'Show a small confirmation panel when a new card is added.', setting: 'cards.addCardConfirmation' },
				{ type: 'switch', title: 'Hide header on focus', desc: 'If you don\'t have much screen real estate, you can hide the header when focusing in the input field.', setting: 'cards.hideHeaderOnFocus' },
				{ type: 'switch', title: 'Show logo', desc: 'Show Polymind logo when list is empty', setting: 'cards.showLogo' },
			] }
		] },
		{ type: 'section', name: 'LanguageSelector', title: 'Language Selector', childs: [
			{ type: 'group', title: 'General', childs: [
				{ type: 'switch', title: 'Show name in native language', desc: 'Will show the language\'s name in its native form.', setting: 'languageSelector.nativeForm' },
				{ type: 'switch', title: 'Display country flag', desc: 'Show language\'s flag next to its name.', setting: 'languageSelector.flags' },
				{ type: 'switch', title: 'Autofocus on search field', desc: 'Be ready to type right after you open the language selector.', setting: 'languageSelector.autoFocusSearch' },
			] },
			{ type: 'group', title: 'Groups', childs: [
				{ type: 'switch', title: 'Current', desc: 'Show current selected language.', setting: 'languageSelector.currentLanguage' },
				{ type: 'switch', title: 'Recents', desc: 'Show languages than has been recently translated.', setting: 'languageSelector.recentLanguages' },
				{ type: 'switch', title: 'Premium', desc: 'Show premium (audio support) languages in the list of results.', setting: 'languageSelector.premiumLanguages' },
				{ type: 'switch', title: 'Others', desc: 'Show other (no audio support) languages in the list of results.', setting: 'languageSelector.otherLanguages' },
			] },
		] },
	] },
	{ type: 'group', title: 'Support', childs: [
		{ type: 'section', name: 'Feedback', title: 'Feedback', screen: 'Feedback' },
		{ type: 'section', name: 'About', title: 'About', screen: 'Page', props: { slug: 'about' } },
	] },
	{ type: 'group', title: 'Legal', childs: [
		{ type: 'section', name: 'Terms', title: 'Terms and Conditions', screen: 'Page', props: { slug: 'terms' } },
		{ type: 'section', name: 'Privacy', title: 'Privacy Policies', screen: 'Page', props: { slug: 'privacy' } },
	] },
];

if (global.__DEV__) {
	sections.push({ type: 'group', title: 'Developers', childs: [
		{ type: 'section', name: 'Debug', title: 'Debug', childs: [
			{ type: 'group', title: 'Settings', childs: [
				{ type: 'button', title: 'Reset settings', action: 'resetSettings' },
			] },
		] },
	] },);
}

export default function Settings(props) {
	return (
		<SettingsHierarchy
			items={sections}
			name={'Settings'}
			prefix={'Settings'}
			{...props}
		/>
	);
}
