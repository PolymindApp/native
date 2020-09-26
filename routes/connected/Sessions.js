import React from 'react';
import db from "../../shared/Database";
import logo from "../../assets/images/polymind-dark.png";
import SettingsContext from "../../contexts/SettingsContext";
import { FooterAction, Icon, SwipeableRow } from "../../shared";
import { Banner, Button, Card, List } from "react-native-paper";
import { FlatList, Image, LayoutAnimation, ScrollView, View } from "react-native";
import { styles } from "../../styles";
import { theme } from "../../theme";

export default function Page({ navigation, route }) {

	React.useEffect(() => init(), []);

	const [settingsContext, patchSettingsContext] = React.useContext(SettingsContext);
	const [sessions, setSessions] = React.useState([]);
	const [selected, setSelected] = React.useState([]);

	const init = () => {
		db.transaction(tx => {
			tx.executeSql("select * from sessions where archived = 0 order by createdOn desc", [], (_, { rows }) => {
				setSessions(rows._array);
			});
		}, null);
	};

	const start = () => {
		navigation.push('Session');
	};

	const toggleSelect = id => {
		const _selected = [...selected];
		const index = _selected.indexOf(id);
		if (index !== -1) {
			selected.splice(index, 1);
		} else {
			_selected.push(id);
		}
		setSelected(_selected);
	};

	const archive = (id, callback = (idx) => {}) => {
		const index = sessions.findIndex(session => session.id === id);
		if (index !== -1) {

			// If selected, remove from list
			const selectedIdx = selected.indexOf(id);
			if (selectedIdx !== -1) {
				toggleSelect(id);
			}

			db.transaction(tx => {
				tx.executeSql("update sessions set archived = 1 where id = ?", [id]);
			}, null);

			callback(index);
		}
	};

	return (
		<View style={styles.max}>

			<Banner
				visible={settingsContext.tips.sessionsExplanation}
				style={styles.min}
				actions={[{
					label: 'Got it',
					onPress: () => {
						patchSettingsContext({ tips: { sessionsExplanation: false } });
					},
				}]}
				icon={({size}) => (
					<Icon name={'lightbulb-on'} color={theme.colors.warning} size={size} />
				)}
			>
				Sessions are sets of cards that you can study that are filtered based on the
				configuration you created them with.
			</Banner>

			{sessions.length === 0 ? (
				<ScrollView contentContainerStyle={[styles.max, styles.inner, styles.middle]}>
					<Image source={logo} style={{
						width: 100,
						height: 116,
						opacity: 0.33,
					}} />
				</ScrollView>
			) : (
				<FlatList
					keyExtractor={item => item.id.toString()}
					style={styles.max}
					contentContainerStyle={{ paddingVertical: 10 }}
					data={sessions}
					renderItem={({item, index}) => (
						<SwipeableRow
							key={item.id}
							item={item}
							swipeThreshold={-150}
							onSwipe={(item) => {
								archive(item.id, index => {
									const _sessions = [ ...sessions ];
									_sessions.splice(index, 1);
									setSessions(_sessions);
									LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
								});
							}}
						>
							<Card>
								<List.Item
									style={{marginHorizontal: 10, marginVertical: 5}}
									word={item}
									selected={selected.indexOf(item.id) !== -1}
									selectable={selected.length > 0}
									onPress={() => {
										if (selected.length > 0) {
											toggleSelect(item.id);
										} else {
											navigation.push('Session', {
												id: item.id,
											});
										}
									}}
									onLongPress={() => {
										toggleSelect(item.id);
									}} />
							</Card>
						</SwipeableRow>
					)}
				/>
			)}

			<FooterAction>
				<View style={styles.inner}>
					<Button icon="plus" mode="contained" onPress={() => start()}>
						Create
					</Button>
				</View>
			</FooterAction>
		</View>
	)
}
