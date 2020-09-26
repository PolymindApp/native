import React from 'react';
import Tags from '../../shared/Tags';
import FooterAction from "../../shared/FooterAction";
import db from "../../shared/Database";
import { TitleIcon, Helpers } from '../../shared';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import { styles, xlarge } from '../../styles';
import { difficulties } from '../../shared/Constants';
import { theme } from '../../theme';
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";

export default function BulkEdit({ navigation, route }) {

	const ids = route.params.ids.split(',').map(item => parseInt(item));
	const defaultState = {
		tags: [],
		difficulties: [],
	};
	const [state, setState] = React.useState(Helpers.deepClone(defaultState));
	const [tags, setTags] = React.useState([]);

	React.useEffect(() => {
		db.transaction(tx => {
			tx.executeSql("select * from tags where archived = 0 order by createdOn desc", [], (_, { rows }) => {
				setTags(rows._array);
			});
		}, null);
	}, []);

	const isDefaultState = JSON.stringify(state) === JSON.stringify(defaultState);

	const apply = function() {
		db.transaction(tx => {
			tx.executeSql("delete from cards_tags where card_id in (?)", [ids.join(',')]);
			ids.forEach(card_id => {
				tags.forEach(tag_id => {
					tx.executeSql("insert into cards_tags (card_id, tag_id) values(?, ?)", [card_id, tag_id]);
				})
			});
			navigation.pop();
		}, null);
	};

	const toggleItem = function(list, item, group) {
		setState(prev => {
			const next = [...prev[group]];
			const index = list.indexOf(item.id);
			if (index !== -1) {
				next.splice(index, 1);
			} else {
				next.push(item.id);
			}
			const result = { ...prev };
			result[group] = next;
			return result;
		});
	}

	const isFocused = useIsFocused();
	navigation.setOptions({
		headerRight: () => isFocused && !isDefaultState ? <TouchableOpacity hitSlop={{ top: 10, bottom: 10, right: 10, left: 10 }} style={{margin: 10}} onPress={() => {
			setState(Helpers.deepClone(defaultState));
		}}>
			<Text style={{color: theme.colors.primary}}>Reset</Text>
		</TouchableOpacity> : null
	});

	return (
		<View style={styles.max}>
			<ScrollView style={[styles.max, styles.inner]}>
				<StatusBar style="dark" />

				<TitleIcon icon={'tag-multiple'}>
					Tags
				</TitleIcon>
				<Tags
					style={styles.pushVertical}
					items={tags}
					selected={state.tags}
					onPress={(item, index) => toggleItem(state.tags, item, 'tags')}
				/>

				<TitleIcon icon={'tag-multiple'} style={{marginTop: xlarge}}>
					Difficulty
				</TitleIcon>
				<Tags
					style={styles.pushVertical}
					items={difficulties}
					selected={state.difficulties}
					onPress={(item, index) => toggleItem(state.difficulties, item, 'difficulties')}
				/>
			</ScrollView>

			<FooterAction>
				<View style={styles.inner}>
					<Button
						mode="contained"
						onPress={() => apply()}
						disabled={isDefaultState}
					>
						Apply
					</Button>
				</View>
			</FooterAction>
		</View>
	);
}
