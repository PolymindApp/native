import React from 'react'
import {ActivityIndicator, Alert, StyleSheet, View, Picker} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PolymindSDK, { THEME, DatasetColumn } from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';
import {Divider, Input, Text} from "react-native-elements";
import {Button} from 'react-native-paper';
import ContextualOptions from "../../../components/ContextualOptions";

const $polymind = new PolymindSDK();
const refInputs = [
	React.createRef(),
	React.createRef(),
	React.createRef(),
];

const supportedLanguageCodes = ['en', 'fr', 'es', 'it', 'cmn', 'cy', 'da', 'de', 'is', 'ja', 'hi', 'ko', 'nb', 'nl', 'pl', 'pt', 'ro', 'ru', 'sv', 'tr',];
const supportedLanguages = supportedLanguageCodes.map(code => ({
	text: I18n.t('language.' + code),
	value: code,
})).sort((a,b) => (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0));

export default class ColumnEditScreen extends React.Component {

	optionItems = [
		{ name: I18n.t('btn.cancel'), callback: () => {}, cancel: true, android: false },
		{ icon: 'delete', name: I18n.t('btn.delete'), callback: () => {
			const { route, navigation } = this.props;
			const column = route.params.column;
			if (!column.id) {
				route.params.datasetSettingsContext.onColumnRemove(route.params.column).then(() => {
					navigation.pop();
				});
			} else {
				Alert.alert(I18n.t('alert.deleteDatasetTitle'), I18n.t('alert.deleteDatasetDesc', { name: column.name }), [
					{ text: I18n.t('btn.delete'), onPress: () => {
						this.setState({ deleting: true });
						route.params.datasetSettingsContext.onColumnRemove(route.params.column).then(() => {
							navigation.pop();
						});
					}, style: 'destructive' },
					{ text: I18n.t('btn.cancel'), style: "cancel" }
				], { cancelable: false });
			}
		}, destructive: true },
	];

	constructor(props) {
		super(props);
		this.state = {
			autofocus: true,
			saving: false,
			deleting: false,
			column: {
				name: props.route.params.column.name,
				lang: props.route.params.column.lang,
			}
		};
	}

	isGuidAlreadyExists(guid) {
		return this.props.route.params.datasetContext.state.dataset.columns.find(column => column.guid === guid) !== undefined;
	}

	save() {
		const { navigation, route } = this.props;
		this.setState({ saving: true });
		Object.assign(route.params.column, this.state.column);

		route.params.datasetSettingsContext.onColumnSave(route.params.column, this.isGuidAlreadyExists(route.params.column.guid)).then(model => {
			navigation.pop();
		});
	}

	componentDidMount() {
		setTimeout(() => {
			this.setState({ autofocus: false });
		});
	}

	hasDifferences() {

		const column = new DatasetColumn(this.state.column);

		const hasDiff = this.state.column.name !== this.props.route.params.column.name
			|| this.state.column.lang !== this.props.route.params.column.lang;

		if (!this.props.route.params.column.id && column.isValid()) {
			return true;
		}

		return hasDiff && column.isValid();
	}

	render() {
		const { navigation, route } = this.props;
		const { column, datasetContext } = route.params;
		const { dataset } = datasetContext.state;

		if (this.state.deleting) {
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
					<Text style={{marginTop: 10, color: THEME.primary}}>{I18n.t('state.deleting')}</Text>
				</View>
			);
		}

		navigation.setOptions({
			title: column.id ? column.name : I18n.t('title.newColumn'),
			headerRight: dataset.columns.length > 1 ? () => (
				<View style={{marginRight: 10}}>
					<ContextualOptions items={this.optionItems} />
				</View>
			) : null
		});

		return (
			<View style={{flex: 1}}>

				<ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>
					<View style={{margin: 10, borderRadius: 10, padding: 5, paddingVertical: 15, backgroundColor: 'white'}}>
						<Input
							clearButtonMode={'always'}
							label={I18n.t('field.columnName')}
							inputStyle={{color:THEME.primary}}
							inputContainerStyle={{borderBottomWidth: 0}}
							defaultValue={this.state.column.name}
							onChangeText={value => this.setState({ column: {...this.state.column, name: value}})}
							returnKeyType = {"done"}
							renderErrorMessage={false}
							autoFocus={this.state.autofocus}
							ref={ref => { refInputs[0] = ref }}
							// onSubmitEditing={() => refInputs[1].focus()}
						/>
					</View>
					<View style={{margin: 10, borderRadius: 10, padding: 5, paddingVertical: 15, backgroundColor: 'white'}}>

						<Text style={{padding: 10, fontWeight: 'bold', fontSize: 16, color: '#999'}}>
							{I18n.t('field.columnLanguage')}
						</Text>

						<Picker
							style={{marginHorizontal: 10}}
							selectedValue={this.state.column.lang}
							onValueChange={value => this.setState({ column: {...this.state.column, lang: value}})}
							ref={ref => { refInputs[1] = ref }}
						>
							{supportedLanguages.map(item => (
								<Picker.Item key={item.value} label={item.text} value={item.value} />
							))}
						</Picker>
						<Text style={{padding: 10}}>
							{I18n.t('field.columnLanguageDesc')}
						</Text>

					</View>
				</ScrollView>

				<View style={{flex: 0, marginHorizontal: 10, marginBottom: 10}}>
					<Divider style={{marginBottom: 10}} />
					<Button mode="contained" onPress={() => this.save()} disabled={!column.isValid() || !this.hasDifferences() || this.state.saving} loading={this.state.saving}>
						{!this.isGuidAlreadyExists(column.guid)
							? I18n.t('btn.add')
							: I18n.t('btn.update')}
					</Button>
				</View>
			</View>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});
