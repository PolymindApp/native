import React from 'react';
import Page from "./Page";
import SettingsBanner from './settings/Banner';
import SettingsSocial from './settings/Social';
import { SettingsHierarchy } from '../../shared';
import { styles, small } from '../../styles';

const defaultGroupProps = { style: { marginTop: small } };

const sections = [
	{ type: 'component', component: SettingsBanner, props: { style: { margin: -small, marginBottom: 0 } } },
	{ type: 'group', title: 'By screen', props: defaultGroupProps, childs: [
		{ type: 'section', name: 'translate', icon: 'translate', title: 'Translate', childs: [
			{ type: 'group', title: 'General', childs: [
				{ type: 'switch', title: 'Auto focus', desc: 'When opening the translate tab, the search field will be autofocused.', setting: 'cards.autoFocus' },
				{ type: 'switch', icon: 'comment-question', title: 'Did you mean?', desc: 'When enabled, an external service will check if current word has been entered properly.', setting: 'cards.didYouMean' },
				{ type: 'switch', title: 'Auto selection', desc: 'Newly added cards will be selected automatically.', setting: 'cards.autoSelectOnAdd' },
				{ type: 'switch', icon: 'voice', title: 'Read newly add word', desc: 'Automatically read newly added word using a synthetic voice when possible.', setting: 'cards.readWordOnAdd' },
				{ type: 'switch', icon: 'alpha-a-box', title: 'Beautify input', desc: 'Will convert the first character of each card to uppercase.', setting: 'cards.firstLetterUpperCase' },
				{ type: 'switch', icon: 'pencil', title: 'Quick edit', desc: 'Switch to edit screen right after adding a new word.', setting: 'cards.gotoSettingsOnAdd' },
			] },
			{ type: 'group', title: 'Features', props: defaultGroupProps, childs: [
				{ type: 'switch', icon: 'microphone', title: 'Speech Recognition', desc: 'A speech recognition button will appear in the middle bottom of the screen.', setting: 'cards.showMicrophone' },
			] },
			{ type: 'group', title: 'Accessibility', props: defaultGroupProps, childs: [
				{ type: 'switch', title: 'New card confirmation cue', desc: 'Show a small confirmation panel when a new card is added.', setting: 'cards.addCardConfirmation' },
				{ type: 'switch', title: 'Hide header on focus', desc: 'If you don\'t have much screen real estate, you can hide the header when focusing in the input field.', setting: 'cards.hideHeaderOnFocus' },
			] }
		] },
		{ type: 'section', name: 'LanguageSelector', icon: 'flag-variant', title: 'Language Selector', childs: [
			{ type: 'group', title: 'General', childs: [
				{ type: 'switch', title: 'Native name', desc: 'Show the language\'s name in its native form.', setting: 'languageSelector.nativeForm' },
				{ type: 'switch', title: 'Country flag', desc: 'Show language\'s flag next to its name.', setting: 'languageSelector.flags' },
				{ type: 'switch', title: 'Autofocus on search field', desc: 'Be ready to type right after you open the language selector.', setting: 'languageSelector.autoFocusSearch' },
			] },
			{ type: 'group', title: 'Sections', props: defaultGroupProps, childs: [
				{ type: 'switch', title: 'Current', desc: 'Show current selected language.', setting: 'languageSelector.currentLanguage' },
				{ type: 'switch', title: 'Recents', desc: 'Show languages than has been recently translated.', setting: 'languageSelector.recentLanguages' },
				{ type: 'switch', title: 'Premium', desc: 'Show premium (audio support) languages in the list of results.', setting: 'languageSelector.premiumLanguages' },
				{ type: 'switch', title: 'Others', desc: 'Show other (no audio support) languages in the list of results.', setting: 'languageSelector.otherLanguages' },
			] },
		] },
	] },
	{ type: 'group', title: 'Application', props: defaultGroupProps, childs: [
		{ type: 'section', name: 'general', icon: 'cellphone', title: 'General', childs: [
			{ type: 'group', title: 'Language', childs: [
				{ type: 'choice', title: 'Language', setting: 'locale', multiple: false, childs: [
					{ key: 'en', title: 'English', },
					{ key: 'fr', title: 'Français', },
					{ key: 'es', title: 'Español', },
					{ key: 'it', title: 'Italiano', },
				] },
			] },
		] },
	] },
	{ type: 'group', title: 'Support', props: defaultGroupProps, childs: [
		{ type: 'section', icon: 'comment-outline', name: 'Feedback', title: 'Feedback', screen: 'Feedback' },
		{ type: 'section', icon: 'information-outline', name: 'About', title: 'About', screen: 'Page', props: { slug: 'about' } },
	] },
	{ type: 'group', title: 'Legal', props: defaultGroupProps, childs: [
		{ type: 'section', name: 'Terms', title: 'Terms and Conditions', screen: 'Page', props: { slug: 'terms' } },
		{ type: 'section', name: 'Privacy', title: 'Privacy Policies', screen: 'Page', props: { slug: 'privacy' } },
	] },

];

const contributeLinks = { type: 'group', title: 'Contribute', props: defaultGroupProps, childs: [
	{ type: 'link', name: 'Github', icon: 'git', title: 'Github', href: 'https://google.com' },
	{ type: 'link', name: 'Patreon', icon: 'patreon', title: 'Patreon', href: 'https://google.com' },
] };
if (global.__DEV__) {
	contributeLinks.childs.push(
		{ type: 'section', name: 'Debug', icon: 'bug', title: 'Debug', childs: [
			{ type: 'group', title: 'Settings', childs: [
				{ type: 'button', title: 'Reset settings', action: 'resetSettings' },
			] },
		] }
	);
}
sections.push(contributeLinks);

sections.push(
	{ type: 'group', title: 'Follow Us', card: false, props: defaultGroupProps, childs: [
		{ type: 'component', component: SettingsSocial },
		{ type: 'text', text: 'Current version: 0.1.18', props: { style: [ styles.center, { opacity: 0.33 }] } },
		{ type: 'sep', },
	] },
);

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
