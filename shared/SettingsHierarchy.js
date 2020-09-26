import React from 'react';
import SettingsContext  from "../contexts/SettingsContext";
import Tools  from "../shared/Tools";
import { View, ScrollView, Linking } from "react-native";
import { Card, List, Divider, Switch, Button, Checkbox, RadioButton, Text } from "react-native-paper";
import { theme } from "../theme";
import { styles } from "../styles";

function SettingsLink({ item }) {
	return <List.Item
		title={item.title}
		left={() => item.icon && (
			<List.Icon icon={item.icon} style={{margin: 0}} />
		)}
		right={() => item.href && (
			<List.Icon icon="chevron-right" style={{margin: 0}} />
		)}
		onPress={() => {
			Linking.openURL(item.href);
		}}
		{...item.props}
	/>
}

function SettingsComponent({ item }) {
	return <item.component {...item.props} />
}

function SettingsSwitch({ item }) {

	const [settingsState, setSettingsState] = React.useContext(SettingsContext);
	const [isSwitchOn, setIsSwitchOn] = React.useState(eval('settingsState.' + item.setting));

	const onToggleSwitch = () => {
		const params = { ...settingsState };
		eval('params.' + item.setting + ' = !isSwitchOn');
		setSettingsState(params);
		setIsSwitchOn(!isSwitchOn);
	};

	return (
		<List.Item
			title={item.title}
			description={item.desc}
			onPress={onToggleSwitch}
			left={() => item.icon && (
				<List.Icon icon={item.icon} style={{margin: 0}} />
			)}
			right={() => <View style={[styles.horizontal, styles.min]}>
				<Switch value={isSwitchOn} color={theme.colors.primary} onValueChange={onToggleSwitch} />
			</View>}
			{...item.props}
		/>
	);
}

function SettingsButton({ item }) {
	return (
		<Button {...item.attrs} onPress={() => {
			Tools.execute(item.action, item.props);
		}} {...item.props}>
			{item.title}
		</Button>
	);
}

function SettingsChoice({ item, choice }) {

	const [settingsState, setSettingsState] = React.useContext(SettingsContext);
	const [selected, setSelected] = React.useState(eval('settingsState.' + item.setting + ' === choice.key'));

	const status = eval('settingsState.' + item.setting + ' === choice.key') ? 'checked' : 'unchecked';

	const onToggleSelect = () => {
		const params = { ...settingsState };
		eval('params.' + item.setting + ' = choice.key');
		setSettingsState(params);
		setSelected(!selected);
	};

	return (
		<List.Item
			title={choice.title}
			description={choice.desc}
			onPress={onToggleSelect}
			left={() => item.multiple ? <Checkbox
				status={status}
				color={theme.colors.primary}
			/> : <RadioButton
				status={status}
				color={theme.colors.primary}
			/>}
			{...item.props}
		/>
	);
}

function SettingsList({ items, navigation, route }) {

	return items.map((item, itemIdx) => {
		switch (item.type) {
			case 'group':
				const Wrapper = item.card !== false ? Card : View;
				return <View key={itemIdx} style={styles.min} {...item.props}>
					<List.Subheader>{item.title}</List.Subheader>
					<Wrapper>
						<SettingsList
							navigation={navigation}
							route={route}
							items={item.childs}
						/>
					</Wrapper>
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
						left={() => item.icon && (
							<List.Icon icon={item.icon} style={{margin: 0}} />
						)}
						right={() => ((item.childs || []).length > 0 || item.screen) && (
							<List.Icon icon="chevron-right" style={{margin: 0}} />
						)}
						{...item.props}
					/>
				</View>
			case 'switch':
				return <View key={itemIdx} style={styles.min}>
					{itemIdx > 0 && <Divider />}
					<SettingsSwitch item={item} />
				</View>
			case 'choice':
				return <Card key={itemIdx} style={styles.min}>
					{item.childs.map((choice, choiceIdx) => [
						choiceIdx > 0 && <Divider/>,
						<SettingsChoice key={choiceIdx} item={item} choice={choice}/>
					])}
				</Card>
			case 'button':
				return <View key={itemIdx} style={styles.min}>
					{itemIdx > 0 && <Divider />}
					<SettingsButton item={item} />
				</View>
			case 'component':
				return <SettingsComponent key={itemIdx} item={item} />
			case 'link':
				return <SettingsLink key={itemIdx} item={item} />
			case 'sep':
				return <View key={itemIdx} style={styles.pushVertical} {...item.props}></View>
			case 'text':
				return <Text key={itemIdx} {...item.props}>
					{item.text}
				</Text>
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
