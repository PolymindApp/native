import React from 'react';
import Tags from '../../shared/Tags';
import FooterAction from "../../shared/FooterAction";
import db from "../../shared/Database";
import TitleIcon from '../../shared/TitleIcon';
import SettingsContext, { SettingsContextInitialState } from "../../contexts/SettingsContext";
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Divider, List, Card, Button, Checkbox, RadioButton, Banner } from 'react-native-paper';
import { styles, medium, xlarge } from '../../styles';
import { sortOrderItem, sortItems, difficulties } from '../../shared/Constants';
import { theme } from '../../theme';
import { useIsFocused } from "@react-navigation/native";
import { Icon } from "../../shared";

export default function Session({ navigation, route }) {

	const [settingsContext, patchSettingsContext] = React.useContext(SettingsContext);
	const [settings, setSettings] = React.useState({ ...settingsContext.filters });

	const [tags, setTags] = React.useState([]);

	React.useEffect(() => {
		db.transaction(tx => {
			tx.executeSql("select * from tags where archived = 0 order by createdOn desc", [], (_, { rows }) => {
				setTags(rows._array);
			});
		}, null);
	}, [])

	const isDefaultState = JSON.stringify(settings) === JSON.stringify(SettingsContextInitialState.filters);
	const isDifferent = JSON.stringify(settings) !== JSON.stringify(settingsContext.filters);
	// TODO: isDifferent won't be valid if Object property not in order. Find a better solution.

	const add = function() {
		navigation.pop();
	};

	const applySort = function(attr, order) {
		setSettings(prev => ({ ...prev, sortAttr: attr, sortOrder: order }));
	};

	const toggleItem = function(list, item, group) {
		setSettings(prev => {
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
			setSettings(SettingsContextInitialState.filters);
		}}>
			<Text style={{color: theme.colors.primary}}>Reset</Text>
		</TouchableOpacity> : null
	});

	return (
		<View style={styles.max}>

			<Banner
				visible={settingsContext.tips.sessionExplanation}
				style={styles.min}
				actions={[{
					label: 'Got it',
					onPress: () => {
						patchSettingsContext({ tips: { sessionExplanation: false } });
					},
				}]}
				icon={({size}) => (
					<Icon name={'lightbulb-on'} color={theme.colors.warning} size={size} />
				)}
			>
				Cards will be filtered based on the tags and difficulties you choose. If none selected, all cards will show up.
			</Banner>

			<ScrollView style={[styles.max, styles.inner]}>

				<TitleIcon icon={'tag-multiple'}>
					Tags
				</TitleIcon>
				<Tags
					style={styles.pushVertical}
					items={tags}
					selected={settings.tags}
					onPress={(item, index) => toggleItem(settings.tags, item, 'tags')}
				/>

				<TitleIcon icon={'tag-multiple'} style={{marginTop: xlarge}}>
					Difficulty
				</TitleIcon>
				<Tags
					style={styles.pushVertical}
					items={difficulties}
					selected={settings.difficulties}
					onPress={(item, index) => toggleItem(settings.difficulties, item, 'difficulties')}
				/>

				<View style={[styles.horizontal, { marginTop: xlarge }]}>
					<TitleIcon icon={'sort'} style={[styles.max]}>
						Sort
					</TitleIcon>
					<Card style={[styles.min]}>
						<View style={styles.horizontal}>
							{sortOrderItem.map((item, itemIdx) => (
								<Button
									key={itemIdx}
									mode={settings.sortOrder === item.key ? 'contained' : 'text'}
									onPress={() => applySort(settings.sortAttr, item.key)}
								>
									{item.title}
								</Button>
							))}
						</View>
					</Card>
				</View>
				<Card style={styles.pushVertical}>
					{sortItems.map((item, itemIdx) => ([
						itemIdx > 0 && <Divider key={itemIdx + '_sep'} />,
						<List.Item
							key={itemIdx}
							title={item.title}
							left={() => <RadioButton
								status={settings.sortAttr === item.key ? 'checked' : 'unchecked'}
								color={theme.colors.primary}
							/>}
							onPress={() => applySort(item.key, settings.sortOrder)}
						/>
					]))}
				</Card>
			</ScrollView>

			<FooterAction>
				<View style={styles.inner}>
					<Button
						mode="contained"
						onPress={() => add()}
					>
						Add
					</Button>
				</View>
			</FooterAction>
		</View>
	);
}
