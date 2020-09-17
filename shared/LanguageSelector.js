import React from 'react';
import I18n from "../locales/i18n";
import Flag from "./Flag";
import SettingsContext from '../contexts/SettingsContext';
import Icon from '../shared/Icon';
import { View, FlatList } from 'react-native';
import { Searchbar, List, Checkbox, Banner, Paragraph, IconButton } from 'react-native-paper';
import { styles } from '../styles';
import { theme } from '../theme';
import { StatusBar } from "expo-status-bar";
import { awsLanguages, notAwsLanguages, nativeLanguageNames } from "./Constants";

export default function LanguageSelector({ navigation, route }) {

	const [settingsState, setSettingsState] = React.useContext(SettingsContext);
	const [searchQuery, setSearchQuery] = React.useState('');
	const onChangeSearch = query => setSearchQuery(query);

	const settings = settingsState.languageSelector;
	const titleKey = settings.nativeForm ? 'native' : 'translated';

	if (route.params?.title) {
		navigation.setOptions({
			title: route.params?.title
		});
	}

	function selectLanguage(lang) {

		navigation.navigate('Cards', {
			lang,
			meta: route.params?.meta,
		});

		const recents = settingsState.recents;
		if (recents.indexOf(lang) === -1) {
			recents.push(lang);
			setSettingsState({ recents });
		}
	}

	function filterLanguages(list, skipRecents = true) {
		return list.filter(lang => {
			if ((settings.currentLanguage && route.params?.current === lang.abbr) || (skipRecents && settingsState.recents.indexOf(lang.abbr) !== -1) ){
				return false;
			}
			return searchQuery.trim() === ''
				|| lang[titleKey].toLowerCase().indexOf(searchQuery.trim().toLowerCase()) !== -1;
		}).sort((a, b) => {
			return a[titleKey] > b[titleKey] ? 1 : -1;
		});
	}

	// Prepare languages
	const filteredPremiumLanguages = settings.premiumLanguages && filterLanguages(premiumLanguages) || [];
	const filteredOtherLanguages = settings.otherLanguages && filterLanguages(otherLanguages) || [];
	const filteredRecents = settings.recentLanguages && filterLanguages(prepareLanguages(settingsState.recents), false) || [];

	// Prepare current language
	let currentLanguage = (settings.currentLanguage && route.params?.current) ? {
		type: 'item',
		key: route.params.current,
		abbr: route.params.current,
		translated: I18n.t('language.' + route.params.current),
		native: nativeLanguageNames[route.params.current],
	} : null;
	if (searchQuery.trim() !== '' && currentLanguage[titleKey].toLowerCase().indexOf(searchQuery.trim()) === -1) {
		currentLanguage = null;
	}

	// Prepare no language found variable
	const nothingFound = (!settings.currentLanguage || !currentLanguage)
		&& (!settings.recentLanguages || filteredRecents.length === 0)
		&& (!settings.premiumLanguages || filteredPremiumLanguages.length === 0)
		&& (!settings.otherLanguages || filteredOtherLanguages.length === 0);

	const list = [];
	if (currentLanguage) {
		list.push({
			key: 'current',
			type: 'header',
			title: 'Current language',
		}, currentLanguage);
	}
	if (filteredRecents.length > 0) {
		list.push({
			key: 'recents',
			type: 'header',
			title: 'Recents',
		}, ...filteredRecents.map(item => ({ ...item, isRecent: true })));
	}
	if (filteredPremiumLanguages.length > 0) {
		list.push({
			key: 'premium',
			type: 'header',
			title: 'Premium (audio supported)',
		}, ...filteredPremiumLanguages);
	}
	if (filteredOtherLanguages.length > 0) {
		list.push({
			key: 'others',
			type: 'header',
			title: 'Others',
		}, ...filteredOtherLanguages);
	}

	return (
		<View style={styles.max}>
			<StatusBar style="dark" />

			<Searchbar
				style={[styles.min, styles.noRadius, styles.elevated]}
				placeholder={I18n.t('input.search')}
				onChangeText={onChangeSearch}
				value={searchQuery}
				autoFocus={settings.autoFocusSearch}
			/>

			<Banner
				visible={settingsState.tips.translateExplanation}
				style={styles.min}
				actions={[{
					label: 'Got it',
					onPress: () => {
						setSettingsState({
							tips: {
								translateExplanation: false,
							}
						});
					},
				}]}
				icon={({size}) => (
					<Icon name={'lightbulb-on'} color={theme.colors.warning} size={size} />
				)}
			>
				You can translate in any language from the list below, but only premium languages can be used to generate audio sessions.
			</Banner>

			{nothingFound && (
				<Paragraph style={styles.inner}>
					No language found based on your search criteria.
				</Paragraph>
			)}

			<FlatList
				data={list}
				keyExtractor={(item) => item.key}
				renderItem={({ item, index }) => {

					const right = item.isRecent
						? <IconButton icon={'close'} onPress={() => {
							const index = settingsState.recents.indexOf(item.abbr);
							if (index !== -1) {
								settingsState.recents.splice(index, 1);
								setSettingsState(settingsState);
							}
						}} />
						: currentLanguage && currentLanguage.abbr === item.abbr && <Checkbox.IOS status={'checked'} color={theme.colors.primary} />;

					switch (item.type) {
						case 'header':
							return <List.Subheader>{item.title}</List.Subheader>;
						case 'item':
							return <List.Item
								title={settings.nativeForm && item.native || item.translated}
								left={() => settings.flags && <View style={[styles.horizontal, styles.min]}>
									<Flag lang={item.abbr} size={24} />
								</View>}
								right={() => right}
								onPress={() => selectLanguage(item.abbr)}
							/>;
					}
				}}
			/>
		</View>
	);
}

function prepareLanguages(list) {
	return list.map(lang => ({
		key: lang,
		type: 'item',
		abbr: lang,
		translated: I18n.t('language.' + lang) || '',
		native: nativeLanguageNames[lang] || '',
	}));
}

const premiumLanguages = prepareLanguages(awsLanguages);
const otherLanguages = prepareLanguages(notAwsLanguages);
