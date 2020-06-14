import React from 'react';
import {KeyboardAvoidingView, Platform, Text, View} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import {Button, List} from "react-native-paper";
import I18n from "../../../locales/i18n";
import {Icon, Input, ListItem} from "react-native-elements";
import { THEME, Dataset, DatasetColumn, DatasetService, DatasetColumnService } from '@polymind/sdk-js';

const refInputs = [
	React.createRef(),
	React.createRef(),
	React.createRef(),
];

export default class DataScreenSettings extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			dataset: props.route.params.dataset,
		};
	}

	_onColumnAdd(column) {
		return new Promise((resolve, reject) => {
			const dataset = this.state.dataset;
			if (dataset.id) {
				this._onColumnSave(column).then(column => resolve(column));
			} else {
				dataset.columns.push(column);
				this.props.route.params.updateOriginal(dataset);
				this.setState({ dataset });
				resolve(column);
			}
		});
	}

	_onColumnUpdate(column) {
		return new Promise((resolve, reject) => {
			const dataset = this.state.dataset;
			const idx = dataset.columns.findIndex(item => item.guid === column.guid);
			if (dataset.id) {
				this._onColumnSave(column).then(column => resolve(column));
			} else {
				dataset.columns[idx] = column;
				this.props.route.params.updateOriginal(dataset);
				this.setState({dataset});
				resolve(column);
			}
		});
	}

	_onColumnSave(column) {
		const dataset = this.state.dataset;
		return DatasetColumnService.save(column).then(model => {
			if (column.id) {
				const idx = dataset.columns.findIndex(item => item.id === column.id);
				Object.assign(dataset.columns[idx], model);
			} else {
				dataset.columns.push(model);
			}
			this.props.route.params.updateOriginal(dataset);
			this.setState({ dataset });
			return model;
		});
	}

	_onColumnRemove(column) {
		const dataset = this.state.dataset;
		return new Promise((resolve, reject) => {
			const callback = () => {
				const idx = dataset.columns.findIndex(item => item.id === column.id);
				dataset.columns.splice(idx, 1);
				this.props.route.params.updateOriginal(dataset);
				this.setState({ dataset });
				resolve();
			}
			column.id ? DatasetColumnService.remove(column.id).then(() => callback()) : callback();
		});
	}

	addColumn() {
		const dataset = this.state.dataset;
		const column = new DatasetColumn({ dataset: dataset.id });
		this.props.navigation.push('NotesColumnEdit', { column, adding: true, onSave: column => this._onColumnSave(column), onAdd: column => this._onColumnAdd(column), onUpdate: column => this._onColumnUpdate(column), onRemove: column => this._onColumnRemove(column)});
	}

	saveDataset() {
		const { navigation, route } = this.props;
		const dataset = this.state.dataset;
		const transactions = dataset.getTransactions(this.state.originalDataset);
		const wasNew = dataset.id === null;

		this.setState({ saving: true });
		DatasetService.save(transactions).then(response => {
			dataset.id = response.dataset[0].result.data.id;
			this.props.route.params.updateOriginal(dataset);
			return route.params.onAdd(dataset, wasNew);
		}).finally(() => {
			this.setState({ dataset, saving: false, wasValid: dataset.isValid() });
		});
	}

	render() {
		const dataset = this.state.dataset;
		const { navigation } = this.props;

		return (
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{flex: 1}}
				keyboardVerticalOffset={Platform.select({ios: 65, android: 130})}
			>
				<ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'handled'}>

					<List.Subheader>{I18n.t('dataset.settings.general')}</List.Subheader>
					<View style={{marginHorizontal: 10, borderRadius: 10, padding: 5, paddingTop: 15, backgroundColor: 'white'}}>
						<Input
							autoFocus={!dataset.id}
							label={I18n.t('field.name')}
							placeholder={I18n.t('field.dataPlaceholder')}
							inputStyle={{color:THEME.primary}}
							defaultValue={dataset.name}
							onChangeText={value => {dataset.name = value; this.setState({dataset});}}
							returnKeyType = {"next"}
							ref={ref => { refInputs[0] = ref }}
							onSubmitEditing={() => refInputs[1].focus()}
						/>
						<Input
							label={I18n.t('field.icon')}
							placeholder={I18n.t('field.dataPlaceholder')}
							inputStyle={{color:THEME.primary}}
							defaultValue={dataset.icon}
							onChangeText={value => {dataset.icon = value; this.setState({dataset});}}
							returnKeyType = {"next"}
							ref={ref => { refInputs[1] = ref }}
							// onSubmitEditing={() => refInputs[2].focus()}
						/>
						{/*<Input*/}
						{/*	label={I18n.t('field.description')}*/}
						{/*	placeholder={I18n.t('field.dataPlaceholder')}*/}
						{/*	inputStyle={{color:THEME.primary}}*/}
						{/*	defaultValue={dataset.description}*/}
						{/*	onChangeText={value => {dataset.description = value; this.setState({dataset});}}*/}
						{/*	returnKeyType = {"done"}*/}
						{/*	ref={ref => { refInputs[2] = ref }}*/}
						{/*	onSubmitEditing={() => {*/}

						{/*	}}*/}
						{/*	multiline*/}
						{/*/>*/}
					</View>

					<List.Subheader style={{marginTop: 15}}>{I18n.t('dataset.settings.columns')}</List.Subheader>
					{dataset.columns.length === 0 ? (
						<View style={{marginHorizontal: 10, padding: 10, backgroundColor: THEME.warning, borderRadius: 5, flexDirection: 'row', alignItems: 'center'}}>
							<Icon name={'alert'} style={{marginRight: 10}} />
							<Text style={{flex: 1, flexWrap: 'wrap'}}>{I18n.t('dataset.settings.noColumnWarn')}</Text>
						</View>
					) : dataset.columns.map((column, columnIdx) => (
						<ListItem
							key={column.guid}
							title={column.name}
							onPress={() => navigation.push('NotesColumnEdit', { dataset, column, onSave: column => this._onColumnSave(column), onAdd: column => this._onColumnAdd(column), onUpdate: column => this._onColumnUpdate(column), onRemove: column => this._onColumnRemove(column) })}
							delayPressIn={0}
							topDivider={columnIdx === 0}
							bottomDivider
							chevron
						/>
					))}
					<View style={{marginHorizontal: 10, marginTop: 15}}>
						<Button mode={'outlined'} onPress={() => this.addColumn()}>{I18n.t('btn.addColumn')}</Button>
					</View>

					{/*<List.Subheader style={{marginTop: 15}}>{I18n.t('dataset.settings.others')}</List.Subheader>*/}
					{/*<ListItem*/}
					{/*	title={I18n.t('dataset.settings.isPrivate')}*/}
					{/*	onPress={() => {*/}
					{/*		dataset.is_private = !dataset.is_private;*/}
					{/*		this.setState({ dataset });*/}
					{/*	}}*/}
					{/*	delayPressIn={0}*/}
					{/*	rightElement={(*/}
					{/*		<View pointerEvents="none">*/}
					{/*			<Checkbox color={THEME.primary} status={dataset.is_private ? 'checked' : 'unchecked'} />*/}
					{/*		</View>*/}
					{/*	)}*/}
					{/*	topDivider*/}
					{/*	bottomDivider*/}
					{/*/>*/}

					<View style={{margin: 10}}>
						<Button mode={'contained'} onPress={() => this.saveDataset()} disabled={!dataset.isValid() || !this.props.route.params.hasDifferences()}>
							{I18n.t('btn.save')}
						</Button>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}
}
