import React from 'react';
import WordCard from "../../shared/WordCard";
import SwipeableRow from "../../shared/SwipeableRow";
import I18n from '../../locales/i18n';
import SettingsContext from '../../contexts/SettingsContext';
import Icon from '../../shared/Icon';
import Warning from '../../shared/Warning';
import Services from '../../shared/Services';
import Contextual from '../../shared/Contextual';
import logo from '../../assets/images/polymind-dark.png';
import db from '../../shared/Database';
import ProgressBar from 'react-native-progress/Bar';
import { View, ScrollView, Keyboard, Image, FlatList, LayoutAnimation, UIManager, Text } from 'react-native';
import {
	Button,
	IconButton,
	Divider,
	TextInput,
	FAB,
	List,
	Snackbar,
	Banner,
	Title,
	Paragraph,
	ActivityIndicator,
	Appbar
} from 'react-native-paper';
import { styles } from '../../styles';
import { theme } from "../../theme";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from '@react-navigation/native';

let inputRef = React.createRef();
let queryTextTimeout;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Cards({ navigation, route }) {

	const [settingsState, setSettingsState] = React.useContext(SettingsContext);
	const settings = settingsState.cards;
	const isFocused = useIsFocused();

	const [querying, setQuerying] = React.useState(false);
	const [text, setText] = React.useState('');
	const [spellCheck, setSpellCheck] = React.useState({
		data: '',
		error: false,
	});
	const [translations, setTranslations] = React.useState({
		data: [],
		error: false,
	});
	const [selected, setSelected] = React.useState([]);
	const [keyboard, setKeyboard] = React.useState(false);
	const [snackbar, setSnackbar] = React.useState(false);
	const [words, setWords] = React.useState(false);

	const queryText = (text, includeSpellCheck = true, includeTranslate = true) => {
		setText(text);
		clearTimeout(queryTextTimeout);

		if (text.trim().length > 0) {
			queryTextTimeout = setTimeout(() => {
				setQuerying(true);
				Promise.all([
					includeTranslate && Services.translate(text, settingsState.fromLang, settingsState.toLang) || false,
					includeSpellCheck && Services.spellCheck(text, settingsState.fromLang) || false,
				]).then(([
					translateResponse,
					spellCheckResponse,
				]) => {

					if (includeTranslate) {
						const state = {
							data: [],
							error: false,
						}
						if (translateResponse.data && translateResponse.data.translations.length > 0) {
							state.data = translateResponse.data.translations.map(item => item.translatedText);
						}
						else if(translateResponse.error) {
							state.error = translateResponse.error;
							console.log(translateResponse);
						}
						setTranslations(state);
					}

					if (includeSpellCheck) {
						const state = {
							data: '',
							error: false,
						}
						if (spellCheckResponse.formatted === false) {
							state.error = true;
							console.log(spellCheckResponse);
						}
						else if (spellCheckResponse.formatted.suggestion.trim().toLowerCase() !== text.trim().toLowerCase()) {
							state.data = spellCheckResponse.formatted.suggestion;
						}
						setSpellCheck(state);
					}
				}).finally(() => {
					setQuerying(false);
				});
			}, 1000);
		}
	};

	React.useEffect(() => {
		db.transaction(tx => {
			tx.executeSql("select * from words order by createdOn desc", [], (_, { rows }) => {
				setWords(rows._array);
			});
		}, null);
	}, []);

	const _keyboardShow = () => {
		setKeyboard(true);

		if (settings.hideHeaderOnFocus) {
			navigation.dangerouslyGetParent().setOptions({
				headerShown: false,
			});
		}
	};
	const _keyboardHide = () => {
		setKeyboard(false);

		if (settings.hideHeaderOnFocus) {
			navigation.dangerouslyGetParent().setOptions({
				headerShown: true,
			});
		}
	};
	React.useEffect(() => {

		const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
		const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

		Keyboard.addListener(showEvent, _keyboardShow);
		Keyboard.addListener(hideEvent, _keyboardHide);

		return () => {
			Keyboard.removeListener(showEvent, _keyboardShow);
			Keyboard.removeListener(hideEvent, _keyboardHide);
		};
	}, []);

	React.useEffect(() => {
		if (route.params?.lang && route.params?.meta) {
			settingsState[route.params.meta] = route.params.lang;
			setSettingsState(settingsState);
		}
	}, [route.params?.lang, route.params?.meta]);

	const addWord = (front, back) => {

		db.transaction(tx => {
			tx.executeSql("insert into words (front, back, frontLang, backLang) values (?, ?, ?, ?)", [
				front,
				back,
				settingsState.fromLang,
				settingsState.toLang,
			], (tx, results) => {
				const id = results.insertId;
				const state = [...words];
				state.unshift({
					id,
					front,
					back,
					frontLang: settingsState.fromLang,
					backLang: settingsState.toLang
				});
				setWords(state);

				if (settings.addCardConfirmation) {
					setSnackbar(true);
				}
				setText('');
				inputRef.blur();
			});
		}, null);
	};

	const removeWord = (item) => {
		const index = words.findIndex(word => word.id === item.id);
		if (index !== -1) {
			db.transaction(tx => {
				tx.executeSql("delete from words where id = ?", [item.id]);
			}, null);

			const state = [ ...words ];
			state.splice(index, 1);
			setWords(state);
		}
	};

	const toggleSelectWord = (item) => {
		const state = [...selected];
		const index = selected.indexOf(item.id);
		if (index !== -1) {
			state.splice(index, 1);
		} else {
			state.push(item.id);
		}
		setSelected(state);
	};

	const selectAll = function() {
		if (selected.length !== words.length) {
			const state = [...selected];
			words.forEach(word => {
				if (selected.indexOf(word.id) === -1) {
					state.push(word.id);
				}
			});
			setSelected(state);
		}
	};

	const unselectAll = function() {
		if (selected.length !== 0) {
			setSelected([]);
		}
	};

	const removeSelected = function() {
		if (selected.length !== 0) {
			setSelected([]);
		}
	};

	const moveSelectedToList = function() {
		if (selected.length !== 0) {
			setSelected([]);
		}
	};

	const tagSelected = function() {
		if (selected.length !== 0) {
			setSelected([]);
		}
	};

	const contextualItems = [
		{ name: 'Cancel', cancel: true, callback: () => {} },
	];

	if (selected.length > 0) {
		contextualItems.unshift({ name: 'Remove selected', callback: removeSelected, destructive: true });
	}
	if (selected.length > 0) {
		contextualItems.unshift({ name: 'Set tags', callback: tagSelected, });
	}
	if (selected.length > 0) {
		contextualItems.unshift({ name: 'Move to list', callback: moveSelectedToList, });
	}
	if (selected.length > 0) {
		contextualItems.unshift({ name: 'Unselect All', callback: unselectAll, });
	}
	if (selected.length !== words.length) {
		contextualItems.unshift({ name: 'Select All', callback: selectAll, });
	}

	navigation.dangerouslyGetParent().setOptions({
		headerRight: () => isFocused ? <View style={styles.horizontal}>
			<IconButton icon="filter-variant" color={'white'} onPress={() => {
				navigation.push('Filters');
			}} />
			<Contextual items={contextualItems} iosIcon={true} />
		</View> : null
	});

	if (words === false) {
		return <View style={[styles.container, styles.middle]}>
			<ActivityIndicator animating={true} color={theme.colors.primary} />
		</View>
	}

	return (
		<View style={styles.container}>
			<View style={[styles.horizontal, styles.min, styles.innerX]}>

				{settings.hideHeaderOnFocus && (
					<StatusBar animated={true} hidden={keyboard} style={'light'} />
				)}

				<Button mode="text" style={styles.max} onPress={() => {
					navigation.navigate('LanguageSelector', {
						title: I18n.t('title.translateFrom'),
						current: settingsState.fromLang,
						meta: 'fromLang',
					})
				}}>
					{I18n.t('language.' + settingsState.fromLang)}
				</Button>

				<IconButton icon="tumblr-reblog" style={styles.min} onPress={() => {
					setSettingsState({
						fromLang: settingsState.toLang,
						toLang: settingsState.fromLang,
					});
				}} />

				<Button mode="text" style={styles.max} onPress={() => {
					navigation.navigate('LanguageSelector', {
						title: I18n.t('title.translateTo'),
						current: settingsState.toLang,
						meta: 'toLang',
					})
				}}>
					{I18n.t('language.' + settingsState.toLang)}
				</Button>
			</View>

			<TextInput
				ref={ref => inputRef = ref}
				value={text}
				placeholder={'Type a word here'}
				right={<TextInput.Icon name="voice" disabled={text.trim().length === 0} />}
				onChangeText={text => queryText(text)}
				underlineColor={'transparent'}
				style={[styles.elevated, { zIndex: 1 }]}
				autoFocus={settings.autoFocus}
			/>
			{querying && (
				<ProgressBar style={{marginTop: -2, zIndex: 2}} width={null} indeterminate={true} color={theme.colors.primary} borderWidth={0} borderRadius={0} height={2} />
			)}

			{((keyboard && text) || text) ? (
				<View style={[styles.max, styles.sheet2]}>

					{translations.data.length > 0 && (
						<View style={[styles.sheet, styles.min]}>
							{translations.data.map((translation, translationIdx) => (
								<View key={translationIdx}>
									{translationIdx > 0 && <Divider />}
									<List.Item
										title={translation}
										right={() => <IconButton
											icon="arrow-right"
											color={theme.colors.primary}
										/>}
										onPress={() => addWord(text, translation)}
									/>
								</View>
							))}
						</View>
					)}
					{spellCheck.data.trim().length > 0 && (
						<ScrollView style={styles.max}>
							<View style={styles.inner}>
								<List.Subheader>Did you mean?</List.Subheader>
								<List.Item
									title={spellCheck.data}
									onPress={() => {
										queryText(spellCheck.data, false);
										const state = { ...spellCheck };
										state.data = '';
										setSpellCheck(state);
									}}
								/>
							</View>
						</ScrollView>
					)}

					{translations.error && (
						<Warning icon={'alert'} text={'We got no answer from the translation service.'} style={{margin: 10}} rounded={true} />
					)}

					{spellCheck.error && (
						<Warning icon={'alert'} text={'We got no answer from the spell check service.'} style={{margin: 10}} rounded={true} />
					)}
				</View>
			) : (
				<View style={styles.max}>
					<Banner
						visible={settingsState.tips.cardsIntro}
						style={styles.min}
						actions={[{
							label: 'Got it',
							onPress: () => {
								setSettingsState({
									tips: {
										cardsIntro: false
									}
								});
							},
						}]}
						icon={({size}) => (
							<Icon name={'lightbulb-on'} color={theme.colors.warning} size={size} />
						)}
					>
						The words you search will appear below. You can organize them by selecting some and assign them tags.
					</Banner>

					{words.length === 0 ? (
						<ScrollView contentContainerStyle={[styles.max, styles.inner]}>
							<View style={[styles.max, styles.middle, { paddingBottom: settings.showLogo ? 60 : 0 }]}>
								{settings.showLogo && !keyboard && (
									<Image source={logo} style={{
										width: 100,
										height: 116,
										opacity: 0.33,
									}} />
								)}
								<View style={[styles.middle, styles.halfWidth]}>
									<Title style={[styles.primaryText, styles.center]}>No card yet</Title>
									<Paragraph style={[styles.transparentText, styles.center]}>Add some by using the input field above.</Paragraph>
								</View>
							</View>
						</ScrollView>
					) : (
						<FlatList
							keyExtractor={item => item.id.toString()}
							style={styles.max}
							contentContainerStyle={{ paddingVertical: 10 }}
							data={words}
							renderItem={({item, index}) => (
								<SwipeableRow
									key={item.id}
									item={item}
									swipeThreshold={-150}
									onSwipe={(item) => {
										LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
										removeWord(item);
									}}
								>
									<WordCard
										style={{marginHorizontal: 10, marginVertical: 5}}
										word={item}
										selected={selected.indexOf(item.id) !== -1}
										selectable={selected.length > 0}
										onPress={() => {
											if (selected.length > 0) {
												toggleSelectWord(item);
											} else {
												navigation.push('Word', {
													id: item.id
												});
											}
										}}
										onLongPress={() => {
											toggleSelectWord(item);
										}} />
								</SwipeableRow>
							)}
						/>
					)}
				</View>
			)}

			{!snackbar && settings.showMicrophone && <FAB
				style={styles.fabCentered}
				icon="microphone"
				color={'white'}
				onPress={() => console.log('Pressed')}
			/>}

			<Snackbar
				visible={snackbar}
				duration={1000}
				onDismiss={() => setSnackbar(false)}
			>
				Card added!
			</Snackbar>
		</View>
	);
};
