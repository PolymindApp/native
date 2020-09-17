import React from 'react';
import SettingsContext  from "../contexts/SettingsContext";
import Tools  from "../shared/Tools";
import { View, ScrollView } from "react-native";
import { Card, List, Divider, Switch, Button } from "react-native-paper";
import { theme } from "../theme";
import { styles } from "../styles";

function SettingsSwitch({ item }) {

	const [settingsState, setSettingsState] = React.useContext(SettingsContext);

	const [isSwitchOn, setIsSwitchOn] = React.useState(eval('settingsState.' + item.setting));
	const onToggleSwitch = () => {
		const params = { ...settingsState };
		eval('settingsState.' + item.setting + ' = !isSwitchOn');
		setSettingsState(params);
		setIsSwitchOn(!isSwitchOn);
	};

	return (
		<List.Item
			title={item.title}
			description={item.desc}
			onPress={onToggleSwitch}
			right={() => <View style={[styles.horizontal, styles.min]}>
				<Switch value={isSwitchOn} color={theme.colors.primary} onValueChange={onToggleSwitch} />
			</View>}
		/>
	);
}

function SettingsButton({ item }) {
	return (
		<Button {...item.attrs} onPress={() => {
			Tools.execute(item.action, item.props);
		}}>
			{item.title}
		</Button>
	);
}

function SettingsList({ items, navigation, route }) {

	return items.map((item, itemIdx) => {
		switch (item.type) {
			case 'group':
				return <View key={itemIdx} style={styles.min}>
					<List.Subheader>{item.title}</List.Subheader>
					<Card>
						<SettingsList
							navigation={navigation}
							route={route}
							items={item.childs}
						/>
					</Card>
				</View>;
			case 'section':
				return <View key={itemIdx} style={styles.min}>
					{itemIdx > 0 && <Divider />}
					<List.Item
						title={item.title}
						description={item.desc}
						onPress={() => {
							if (item.childs && item.childs.length > 0) {
								navigation.push('SettingsHierarchy', {
									items: item.childs,
									title: item.title,
								});
							} else if (item.screen) {
								navigation.push(item.screen, item.props);
							}
						}}
						right={() => ((item.childs || []).length > 0 || item.screen) && (
							<List.Icon icon="chevron-right" style={{margin: 0}} />
						)}
					/>
				</View>
			case 'switch':
				return <View key={itemIdx} style={styles.min}>
					{itemIdx > 0 && <Divider />}
					<SettingsSwitch item={item} />
				</View>
			case 'button':
				return <View key={itemIdx} style={styles.min}>
					{itemIdx > 0 && <Divider />}
					<SettingsButton item={item} />
				</View>
		}
	});
}

export default function SettingsHierarchy({ navigation, route, items }) {

	const params = route.params || {};
	items = items || params.items;

	if (params.title) {
		navigation.setOptions({
			headerTitle: params.title,
		});
	}

	return (
		<ScrollView contentContainerStyle={styles.inner} style={styles.max}>
			<SettingsList navigation={navigation} route={route} items={items} />
		</ScrollView>
	)
}
