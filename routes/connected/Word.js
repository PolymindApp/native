import React from 'react';
import I18n from "../../locales/i18n";
import FooterAction from "../../shared/FooterAction";
import Icon from "../../shared/Icon";
import db from "../../shared/Database";
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { TextInput, Button, ActivityIndicator } from "react-native-paper";
import { styles } from "../../styles";
import { theme } from "../../theme";

export default function Word({ navigation, route }) {

	const { id } = route.params;

	const [words, setWords] = React.useState([]);
	const [word, setWord] = React.useState(false);
	const [index, setIndex] = React.useState(-1);
	const [front, setFront] = React.useState('');
	const [back, setBack] = React.useState('');
	const [newTag, setNewTag] = React.useState('');

	const updateStates = function(items, id) {
		const index = items.findIndex(item => item.id === id);
		const item = items[index];
		setWords(items);
		setWord(items[index]);
		setIndex(index);
		setFront(item.front);
		setBack(item.back);
	}

	React.useEffect(() => {
		db.transaction(tx => {
			tx.executeSql("select * from words", [], (_, { rows }) => {
				const items = rows._array;
				updateStates(items, id);
			});
		}, null);
	}, []);

	if (word === false) {
		return <View style={[styles.container, styles.middle]}>
			<ActivityIndicator animating={true} color={theme.colors.primary} />
		</View>
	}

	navigation.setOptions({
		title: I18n.t('title.word', {
			index: index + 1,
			total: words.length,
		}),
		headerRight: () => (
			<TouchableOpacity hitSlop={{ top: 10, bottom: 10, right: 10, left: 10 }} style={{margin: 10}} onPress={() => {
				navigation.pop();
			}}>
				<Text style={{color: 'white'}}>Cancel</Text>
			</TouchableOpacity>
		),
	});

	const previous = function() {
		let newIdx = index - 1;
		if (newIdx < 0) {
			newIdx = words.length - 1;
		}
		const previousItem = words[newIdx];
		navigation.navigate('Word', { id: previousItem.id });
		updateStates(words, previousItem.id);
	};

	const next = function() {
		let newIdx = index + 1;
		if (newIdx > words.length - 1) {
			newIdx = 0;
		}
		const nextItem = words[newIdx];
		navigation.navigate('Word', { id: nextItem.id });
		updateStates(words, nextItem.id);
	};

	const apply = function() {
		navigation.pop();
	};

	return (
		<View style={styles.max}>
			<ScrollView>
				<TextInput
					value={front}
					label={'Front'}
					placeholder={'Type here...'}
					right={<TextInput.Icon name="voice" disabled={front.trim().length === 0} />}
					onChangeText={text => setFront(text)}
				/>
				<TextInput
					value={back}
					label={'Back'}
					placeholder={'Type here...'}
					right={<TextInput.Icon name="voice" disabled={back.trim().length === 0} />}
					onChangeText={text => setBack(text)}
				/>

				{/*TAGS*/}
				<View style={styles.inner}>
					<TextInput
						mode={'outlined'}
						value={newTag}
						label={'New tag'}
						placeholder={'Type here...'}
						left={<TextInput.Icon name={'tag-plus'} />}
						onChangeText={value => setNewTag(value)}
					/>
				</View>
			</ScrollView>
			<FooterAction>
				<View style={[styles.inner, styles.horizontal]}>
					{words.length > 1 && (<Button style={{marginRight: 10}} mode={'text'} onPress={() => previous()}>
						<Icon name={'chevron-left'} size={24} />
					</Button>)}
					<Button style={styles.max} mode={'contained'} onPress={() => apply()}>
						<Icon name={word.id ? 'content-save' : 'plus'} color={'white'} size={24} />
					</Button>
					{words.length > 1 && (<Button style={{marginLeft: 10}} mode={'text'} onPress={() => next()}>
						<Icon name={'chevron-right'} size={24} />
					</Button>)}
				</View>
			</FooterAction>
		</View>
	)
}
