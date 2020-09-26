import React from 'react';
import I18n from "../../locales/i18n";
import db from "../../shared/Database";
import { Icon, FooterAction, Tools, BackButton, Tags, Flag, Color, TitleIcon, Contextual, difficulties } from "../../shared";
import { View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, ActivityIndicator, Snackbar } from "react-native-paper";
import { styles, medium, xlarge } from "../../styles";
import { theme } from "../../theme";

export default function Word({ navigation, route }) {

	const { id, adding } = route.params;

	const [originalFormState, setOriginalFormState] = React.useState(false);
	const [tagsState, setTagsState] = React.useState([]);

	const [formState, setFormState] = React.useState({
		front: '',
		back: '',
		newTag: '',
		selectedTags: [],
		selectedDifficulties: [],
	});
	const [state, setState] = React.useState({
		words: [],
		word: false,
		index: -1,
		saved: false,
	});

	const updateStates = function(items, id) {
		const index = items.findIndex(item => item.id === id);
		const item = items[index];

		setFormState(prev => ({
			...prev,
			front: item.front,
			back: item.back,
		}));

		setState(prev => ({
			...prev,
			words: items,
			word: items[index],
			index,
		}));

		loadSelectedTags();
	};

	const loadSelectedTags = function() {
		db.transaction(tx => {
			tx.executeSql("select * from cards_tags where card_id = ? and archived = 0", [id], (_, { rows }) => {
				setFormState(prev => ({ ...prev, selectedTags: rows._array.map(item => item.tag_id ) }));
			});
		});
	};

	const archive = function(force = false) {
		if (!force) {
			Alert.alert(I18n.t('alert.archiveCardTitle'), I18n.t('alert.archiveCardDesc'), [
				{ text: I18n.t('btn.archive'), onPress: () => {
					archive(true);
				}, style: 'destructive' },
				{ text: I18n.t('btn.cancel'), style: "cancel" }
			], { cancelable: false });
		} else {
			db.transaction(tx => {
				tx.executeSql("update cards set archived = 1 where id = ?", [id], (_, rows) => {
					let newIdx = state.index;
					state.words.splice(newIdx, 1);
					if (newIdx > state.words.length - 1) {
						newIdx--;
					}
					if (newIdx < 0) {
						navigation.pop();
						return;
					}
					const previousItem = state.words[newIdx];
					navigation.navigate('Word', { id: previousItem.id });
					updateStates(state.words, previousItem.id);
				});
			}, null);
		}
	};

	const previous = function() {
		Tools.leaveWarning(isFormDifferent, () => {
			let newIdx = state.index - 1;
			if (newIdx < 0) {
				newIdx = state.words.length - 1;
			}
			const previousItem = state.words[newIdx];
			navigation.navigate('Word', { id: previousItem.id });
			updateStates(state.words, previousItem.id);
		}, 'Previous');
	};

	const next = function() {
		Tools.leaveWarning(isFormDifferent, () => {
			let newIdx = state.index + 1;
			if (newIdx > state.words.length - 1) {
				newIdx = 0;
			}
			const nextItem = state.words[newIdx];
			navigation.navigate('Word', { id: nextItem.id });
			updateStates(state.words, nextItem.id);
		}, 'Next');
	};

	const apply = function() {
		db.transaction(tx => {

			// Reset tags
			tx.executeSql("delete from cards_tags where card_id = ?", [id]);
			formState.selectedTags.forEach(tagId => {
				tx.executeSql("insert into cards_tags (card_id, tag_id) values (?, ?)", [id, tagId]);
			});

			tx.executeSql("update cards set front = ?, back = ?, frontLang = ?, backLang = ? where id = ?", [
				formState.front,
				formState.back,
				state.word.frontLang,
				state.word.backLang,
				id,
			], (tx, results) => {
				if (adding) {
					navigation.pop();
				} else {
					setState(prev => {

						const words = [ ...prev.words ];
						words[state.index] = {
							...prev.word,
							front: formState.front,
							back: formState.back,
						};

						return {
							...prev,
							added: true,
							word: words[state.index],
							words,
						}
					});

					setOriginalFormState({ ...formState });
				}
			});
		}, null);
	};

	const loadTags = function() {
		db.transaction(tx => {
			tx.executeSql("select * from tags where archived = 0 order by createdOn desc", [], (_, { rows }) => {
				setTagsState(rows._array);
			});
		}, null);
	};

	const addTag = function() {
		const tag = formState.newTag.trim().toLowerCase();
		if (tag.length > 0) {

			const finish = (id) => {
				setFormState(prev => {
					const selectedTags = [...prev.selectedTags, id];
					return { ...prev, selectedTags, newTag: '' };
				});
				loadTags();
			};

			const existingTag = tagsState.find(item => item.key === tag);
			if (!existingTag) {
				db.transaction(tx => {
					const hex = Color.stringToHex(tag);
					const color = '#' + hex;
					const dark = Color.isDark(hex);

					tx.executeSql("insert into tags (key, color, dark) values (?, ?, ?)", [
						tag, color, dark
					], (tx, results) => {
						const id = results.insertId;
						finish(id);
					});
				}, null);
			} else {
				finish(existingTag.id);
			}
		}
	};

	const init = function() {
		db.transaction(tx => {
			tx.executeSql("select * from cards where archived = 0", [], (_, { rows }) => {
				const items = rows._array;
				updateStates(items, id);
			});
		}, null);
	};

	React.useEffect(() => {
		setOriginalFormState({ ...formState });
	}, [state.index]);

	React.useEffect(() => {
		loadTags();
		init();
	}, []);

	if (state.word === false) {
		return <View style={[styles.container, styles.middle]}>
			<ActivityIndicator animating={true} color={theme.colors.primary} />
		</View>
	}

	const isFormDifferent = JSON.stringify(originalFormState) !== JSON.stringify(formState);

	const contextualItems = [
		{ name: 'Archive', destructive: true, callback: () => {
			archive();
		} },
		{ name: 'Cancel', cancel: true, callback: () => {
			Tools.leaveWarning(isFormDifferent, () => navigation.pop());
		} },
	];
	navigation.setOptions({
		title: I18n.t('title.word', {
			index: state.index + 1,
			total: state.words.length,
		}),
		headerLeft: () => <BackButton onPress={() => {
			//TODO: Listen to navigation change instead..
			Tools.leaveWarning(isFormDifferent, () => navigation.pop());
		}} />,
		headerRight: () => <Contextual items={contextualItems} />,
	});

	return (
		<View style={styles.max}>
			<ScrollView>

				<TextInput
					value={formState.front}
					label={[<Flag key={'flag'} lang={state.word.frontLang} size={24} />, ' Front' + ' (' + state.word.frontLang.toUpperCase() + ')']}
					placeholder={'Type here...'}
					right={<TextInput.Icon name="voice" disabled={formState.front.trim().length === 0} />}
					onChangeText={value => setFormState(prev => ({ ...prev, front: value }))}
				/>
				<TextInput
					value={formState.back}
					label={[<Flag key={'flag'} lang={state.word.backLang} size={24} />, ' Back' + ' (' + state.word.backLang.toUpperCase() + ')']}
					placeholder={'Type here...'}
					right={<TextInput.Icon name="voice" disabled={formState.back.trim().length === 0} />}
					onChangeText={value => setFormState(prev => ({ ...prev, back: value }))}
				/>

				{/*TAGS*/}
				<View style={styles.inner}>
					<TitleIcon icon={'tag-multiple'}>
						Tags
					</TitleIcon>
					<TextInput
						mode={'outlined'}
						value={formState.newTag}
						label={'Type here...'}
						left={<TextInput.Icon name={'tag-plus'} />}
						onChangeText={value => {
							setFormState(prev => ({ ...prev, newTag: value }));
						}}
						onSubmitEditing={() => addTag()}
					/>
					<Tags
						style={{marginTop: medium}}
						items={tagsState}
						selected={formState.selectedTags}
						onPress={(item, index) => {
							setFormState(prev => {
								const next = [...prev.selectedTags];
								const index = prev.selectedTags.indexOf(item.id);
								if (index !== -1) {
									next.splice(index, 1);
								} else {
									next.push(item.id);
								}
								return { ...prev, selectedTags: next };
							});
						}}
					/>

					<TitleIcon icon={'tag-multiple'} style={{marginTop: xlarge}}>
						Difficulties
					</TitleIcon>
					<Tags
						style={{marginTop: medium}}
						items={difficulties}
						selected={formState.selectedDifficulties}
						onPress={(item, index) => {
							setFormState(prev => {
								const next = [...prev.selectedDifficulties];
								const index = prev.selectedDifficulties.indexOf(item.id);
								if (index !== -1) {
									next.splice(index, 1);
								} else {
									next.push(item.id);
								}
								return { ...prev, selectedDifficulties: next };
							});
						}}
					/>
				</View>
			</ScrollView>
			<FooterAction>
				<View style={[styles.inner, styles.horizontal]}>
					{state.words.length > 1 && (<Button style={{marginRight: 10}} mode={'text'} onPress={() => previous()}>
						<Icon name={'chevron-left'} size={24} />
					</Button>)}
					<Button style={styles.max} mode={'contained'} onPress={() => apply()} disabled={!isFormDifferent}>
						<Icon name={state.word.id ? 'content-save' : 'plus'} color={'white'} size={24} />
					</Button>
					{state.words.length > 1 && (<Button style={{marginLeft: 10}} mode={'text'} onPress={() => next()}>
						<Icon name={'chevron-right'} size={24} />
					</Button>)}
				</View>
			</FooterAction>
			<Snackbar
				visible={state.added}
				duration={1000}
				onDismiss={() => setState(prev => ({ ...prev, added: false }))}
			>
				Saved!
			</Snackbar>
		</View>
	)
}
