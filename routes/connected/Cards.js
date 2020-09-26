import React from 'react';
import I18n from '../../locales/i18n';
import SettingsContext from '../../contexts/SettingsContext';
import logo from '../../assets/images/polymind-dark.png';
import ProgressBar from 'react-native-progress/Bar';
import db from "../../shared/Database";
import { Icon, Warning, Services, Contextual, WordCard, SwipeableRow } from "../../shared";
import { View, ScrollView, Keyboard, Image, FlatList, LayoutAnimation, UIManager, Platform, Alert } from 'react-native';
import { Button, IconButton, Divider, TextInput, FAB, List, Snackbar, Banner, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { styles } from '../../styles';
import { theme } from "../../theme";

import { StatusBar } from "expo-status-bar";

let isFocused = true;
let inputRef = React.createRef();
let queryTextTimeout;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Cards({ navigation, route }) {

	const [settingsState, patchSettingsState] = React.useContext(SettingsContext);
	const settings = settingsState.cards;

	const [state, setState] = React.useState({
		querying: false,
		recording: false,
		front: '',
		back: '',
		networkError: false,
		spellCheck: {
			data: '',
			error: false,
		},
		translations: {
			data: [],
			error: false,
		},
		selected: [],
		keyboard: false,
		snackbar: false,
		words: false,
	});
	const patchState = function(params) {
		setState(prev => ({
			...prev,
			...params,
		}));
	};

	const queryText = (text, includeSpellCheck = true, includeTranslate = true) => {
		patchState({ front: text });
		clearTimeout(queryTextTimeout);

		if (text.trim().length > 0) {
			queryTextTimeout = setTimeout(() => {
				patchState({ querying: true, networkError: false });
				Promise.all([
					includeTranslate && Services.translate(text, settingsState.fromLang, settingsState.toLang) || false,
					includeSpellCheck && Services.spellCheck(text, settingsState.fromLang) || false,
				]).then(([
					translateResponse,
					spellCheckResponse,
				]) => {

					if (includeTranslate) {
						const stateTranslations = {
							data: [],
							error: false,
						}
						if (translateResponse.data && translateResponse.data.translations.length > 0) {
							stateTranslations.data = translateResponse.data.translations.map(item => item.translatedText);
						}
						else if(translateResponse.error) {
							stateTranslations.error = translateResponse.error;
							console.log(translateResponse);
						}
						patchState({ translations: stateTranslations });
					}

					if (includeSpellCheck) {
						const stateSpellCheck = {
							data: '',
							error: false,
						}
						if (spellCheckResponse.formatted === false) {
							stateSpellCheck.error = true;
							console.log(spellCheckResponse);
						}
						else if (spellCheckResponse.formatted.suggestion.trim().toLowerCase() !== text.trim().toLowerCase()) {
							stateSpellCheck.data = spellCheckResponse.formatted.suggestion;
						}
						patchState({ spellCheck: stateSpellCheck });
					}
				}).catch(reason => {
					patchState({ networkError: true });
				}).finally(() => {
					patchState({ querying: false });
				});
			}, 750);
		}
	};

	const _navigationFocus = () => {
		isFocused = true;
		if (route.params?.lang && route.params?.meta) {
			settingsState[route.params.meta] = route.params.lang;
			patchSettingsState(settingsState);
		}
		loadWords();
	};
	const _navigationBlur = () => {
		isFocused = false;
	};
	const _keyboardShow = () => {
		if (isFocused) {
			patchState({ keyboard: true });

			if (settings.hideHeaderOnFocus) {
				navigation.dangerouslyGetParent().setOptions({
					headerShown: false,
				});
			}
		}
	};
	const _keyboardHide = () => {
		if (isFocused) {
			patchState({ keyboard: false });

			if (settings.hideHeaderOnFocus) {
				navigation.dangerouslyGetParent().setOptions({
					headerShown: true,
				});
			}
		}
	};
	React.useEffect(() => {

		const _navigationFocusHandler = navigation.addListener('focus', _navigationFocus);
		const _navigationBlurHandler = navigation.addListener('blur', _navigationBlur);

		const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
		const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

		Keyboard.addListener(showEvent, _keyboardShow);
		Keyboard.addListener(hideEvent, _keyboardHide);

		return () => {
			_navigationFocusHandler();
			_navigationBlurHandler();
			Keyboard.removeListener(showEvent, _keyboardShow);
			Keyboard.removeListener(hideEvent, _keyboardHide);
		};
	}, []);

	const toggleRecord = () => {
		patchState({ recording: !state.recording });
	};

	const loadWords = () => {
		db.transaction(tx => {
			tx.executeSql("select * from cards where archived = 0 order by createdOn desc", [], (_, { rows }) => {
				patchState({ words: rows._array });
			});
		}, null);
	};

	const addWord = (front, back) => {

		db.transaction(tx => {
			tx.executeSql("insert into cards (front, back, frontLang, backLang) values (?, ?, ?, ?)", [
				front,
				back,
				settingsState.fromLang,
				settingsState.toLang,
			], (tx, results) => {
				const id = results.insertId;
				const words = [...state.words];
				words.unshift({
					id,
					front,
					back,
					frontLang: settingsState.fromLang,
					backLang: settingsState.toLang
				});
				patchState({ words });

				if (settings.addCardConfirmation) {
					patchState({ snackbar: true });
				}
				patchState({ front: '' });
				patchState({ back: '' });
				inputRef.blur();

				if (settings.gotoSettingsOnAdd) {
					navigation.push('Word', { id, adding: true });
				}
			});
		}, null);
	};

	const toggleSelectWord = id => {
		const selected = [...state.selected];
		const index = selected.indexOf(id);
		if (index !== -1) {
			selected.splice(index, 1);
		} else {
			selected.push(id);
		}
		patchState({ selected });
	};

	const selectAll = function() {
		if (state.selected.length !== state.words.length) {
			const selected = [...state.selected];
			state.words.forEach(word => {
				if (selected.indexOf(word.id) === -1) {
					selected.push(word.id);
				}
			});
			patchState({ selected });
		}
	};

	const unselectAll = function() {
		if (state.selected.length !== 0) {
			patchState({ selected: [] })
		}
	};

	const archiveWord = (id, callback = (idx) => {}) => {
		const index = state.words.findIndex(word => word.id === id);
		if (index !== -1) {

			// If selected, remove from list
			const selectedIdx = state.selected.indexOf(id);
			if (selectedIdx !== -1) {
				toggleSelectWord(id);
			}

			db.transaction(tx => {
				tx.executeSql("update cards set archived = 1 where id = ?", [id]);
			}, null);

			callback(index);
		}
	};

	const archiveSelected = function(force = false) {
		if (!force) {
			Alert.alert(I18n.t('alert.archiveCardsTitle'), I18n.t('alert.archiveCardsDesc'), [
				{ text: I18n.t('btn.archive'), onPress: () => {
					archiveSelected(true);
				}, style: 'destructive' },
				{ text: I18n.t('btn.cancel'), style: "cancel" }
			], { cancelable: false });
		} else if (state.selected.length !== 0) {
			let i = 0;
			const words = [ ...state.words ];
			state.selected.forEach(id => archiveWord(id, idx => {
				words.splice(idx - i, 1);
				i++;
				if (state.selected.length === i) {
					patchState({ words, selected: [] });
				}
			}));
		}
	};

	const tagSelected = function() {
		if (state.selected.length !== 0) {
			navigation.push('BulkEdit', {
				ids: state.selected.join(',')
			});
		}
	};

	const contextualItems = [
		{ name: 'Cancel', cancel: true, callback: () => {} },
	];

	if (state.selected.length > 0) {
		contextualItems.unshift({ name: 'Archive', callback: archiveSelected, destructive: true });
	}
	if (state.selected.length > 0) {
		contextualItems.unshift({ name: 'Set tags', callback: tagSelected, });
	}
	if (state.selected.length > 0) {
		contextualItems.unshift({ name: 'Unselect All', callback: unselectAll, });
	}
	if (state.selected.length !== state.words.length) {
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

	if (state.words === false) {
		return <View style={[styles.container, styles.middle]}>
			<ActivityIndicator animating={true} color={theme.colors.primary} />
		</View>
	}

	return (
		<View style={styles.container}>
			<View style={[styles.horizontal, styles.min, styles.innerX]}>

				{settings.hideHeaderOnFocus && (
					<StatusBar animated={true} hidden={state.keyboard} style={'light'} />
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
					patchSettingsState({
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
				value={state.front}
				label={state.front && 'Front'}
				placeholder={'Type here...'}
				right={<TextInput.Icon name="voice" disabled={state.front.trim().length === 0} />}
				onChangeText={value => queryText(value)}
				underlineColor={'transparent'}
				style={[styles.elevated, { zIndex: 1 }]}
				autoFocus={settings.autoFocus}
			/>
			{state.querying && (
				<ProgressBar style={{marginTop: -2, zIndex: 2}} width={null} indeterminate={true} color={theme.colors.primary} borderWidth={0} borderRadius={0} height={2} />
			)}

			{state.recording ? (
				<View style={[styles.max, styles.inner, styles.middle]}>
					<Title>Speak...</Title>
				</View>
			) : (
				((state.keyboard && state.front) || state.front) ? (
					<View style={[styles.max, styles.sheet2]}>

						{state.translations.data.length > 0 && (
							<View style={[styles.sheet, styles.min]}>
								{state.translations.data.map((translation, translationIdx) => (
									<View key={translationIdx}>
										{translationIdx > 0 && <Divider />}
										<List.Item
											title={translation}
											right={() => <IconButton
												icon="arrow-right"
												color={theme.colors.primary}
											/>}
											onPress={() => addWord(state.front, translation)}
										/>
									</View>
								))}
							</View>
						)}
						{state.translations.length > 0 && <Divider />}
						<TextInput
							value={state.back}
							label={'Back'}
							placeholder={'Type a word here'}
							right={<TextInput.Icon
								name="arrow-right"
								disabled={state.back.trim().length === 0}
								onPress={() => addWord(state.front, state.back)}
							/>}
							onChangeText={value => patchState({ back: value })}
							underlineColor={'transparent'}
							style={[styles.elevated, { zIndex: 1 }]}
						/>
						{state.spellCheck.data.trim().length > 0 && (
							<ScrollView style={styles.max}>
								<View style={styles.inner}>
									<List.Subheader>Did you mean?</List.Subheader>
									<List.Item
										title={state.spellCheck.data}
										onPress={() => {
											queryText(spellCheck.data, false);
											const spellCheck = { ...state.spellCheck };
											spellCheck.data = '';
											patchState({ spellCheck });
										}}
									/>
								</View>
							</ScrollView>
						)}

						{state.networkError && (
							<Warning icon={'alert'} text={'Network error. Check your internet connection.'} style={{margin: 10}} rounded={true} />
						)}

						{state.translations.error && (
							<Warning icon={'alert'} text={'We got no answer from the translation service.'} style={{margin: 10}} rounded={true} />
						)}

						{state.spellCheck.error && (
							<Warning icon={'alert'} text={'We got no answer from the spell check service.'} style={{margin: 10}} rounded={true} />
						)}
					</View>
				) : (
					<View style={styles.max}>
						{!state.keyboard && <Banner
							visible={settingsState.tips.cardsIntro}
							style={styles.min}
							actions={[{
								label: 'Got it',
								onPress: () => {
									patchSettingsState({
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
						</Banner>}

						{state.words.length === 0 ? (
							<ScrollView contentContainerStyle={[styles.max, styles.inner]}>
								<View style={[styles.max, styles.middle, { paddingBottom: settings.showLogo ? 60 : 0 }]}>
									<Image source={logo} style={{
										width: 100,
										height: 116,
										opacity: 0.33,
									}} />
								</View>
							</ScrollView>
						) : (
							<FlatList
								keyExtractor={item => item.id.toString()}
								style={styles.max}
								contentContainerStyle={{ paddingVertical: 10 }}
								data={state.words}
								renderItem={({item, index}) => (
									<SwipeableRow
										key={item.id}
										item={item}
										swipeThreshold={-150}
										onSwipe={(item) => {
											archiveWord(item.id, index => {
												const words = [ ...state.words ];
												words.splice(index, 1);
												patchState({ words });
												LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
											});
										}}
									>
										<WordCard
											style={{marginHorizontal: 10, marginVertical: 5}}
											word={item}
											selected={state.selected.indexOf(item.id) !== -1}
											selectable={state.selected.length > 0}
											onPress={() => {
												if (state.selected.length > 0) {
													toggleSelectWord(item.id);
												} else {
													navigation.push('Word', {
														id: item.id,
													});
												}
											}}
											onLongPress={() => {
												toggleSelectWord(item.id);
											}} />
									</SwipeableRow>
								)}
							/>
						)}
					</View>
				)
			)}

			{!state.snackbar && settings.showMicrophone && <FAB
				style={[styles.fabCentered, {
					backgroundColor: state.recording ? theme.colors.primary : 'white'
				}]}
				icon="microphone"
				color={state.recording ? 'white' : theme.colors.primary}
				mode
				onPress={() => toggleRecord()}
			/>}

			<Snackbar
				visible={state.snackbar}
				duration={1000}
				onDismiss={() => patchState({ snackbar: false })}
			>
				Card added!
			</Snackbar>
		</View>
	);
};
