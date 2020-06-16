import React from 'react';
import {KeyboardAvoidingView, Platform, Text, View} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import {Button, List} from "react-native-paper";
import I18n from "../../../locales/i18n";
import {Divider, Icon, Input, ListItem} from "react-native-elements";
import { THEME, DatasetColumn, DatasetService, DatasetColumnService, Dataset, Helpers } from '@polymind/sdk-js';
import IconSelector from "../../../components/IconSelector";

const refInputs = [
	React.createRef(),
	React.createRef(),
	React.createRef(),
];

export default class DataScreenSettings extends React.Component {

	state = {
		saving: false,
	}

	handleAddColumn() {
		const dataset = this.props.route.params.datasetContext.state.dataset;
		const column = new DatasetColumn({ dataset: dataset.id });
		this.props.navigation.push('NotesColumnEdit', { ...this.props.route.params, column, datasetSettingsContext: this});
	}

	onColumnSave(column) {
		const dataset = this.props.route.params.datasetContext.state.dataset;
		return new Promise((resolve, reject) => {
			const callback = (column, wasNew) => {
				if (wasNew) {
					dataset.columns.push(column);
				} else {
					const idx = dataset.columns.findIndex(item => item.guid === column.guid);
					dataset.columns[idx] = column;
				}

				this.props.route.params.datasetContext.updateOriginal(dataset);
				this.setState({dataset});
				resolve(column);
			};

			if (dataset.id) {
				DatasetColumnService.save(column).then(model => {
					return callback(model, !column.id);
				});
			} else {
				callback(column, true);
			}
		});
	}

	onColumnRemove(column) {
		const dataset = this.props.route.params.datasetContext.state.dataset;
		return new Promise((resolve, reject) => {
			const callback = () => {
				const idx = dataset.columns.findIndex(item => item.id === column.id);
				dataset.columns.splice(idx, 1);
				this.props.route.params.datasetContext.updateOriginal(dataset);
				this.setState({dataset});
				resolve();
			}
			column.id ? DatasetColumnService.remove(column.id).then(() => callback()) : callback();
		});
	}

	save() {
		const { navigation, route } = this.props;
		const datasetContext = route.params.datasetContext;
		const datasetsContext = route.params.datasetsContext;
		const dataset = datasetContext.state.dataset;
		const clone = new Dataset(Helpers.deepClone(dataset));
		const transactions = clone.getTransactions(datasetContext.state.originalDataset);
		const wasNew = clone.id === null;

		this.setState({ saving: true });
		DatasetService.save(transactions).then(response => {

			if (wasNew) {
				dataset.columns = [];
			}

			dataset.applyTransactionResponse(response);
			dataset.id = response.dataset[0].result.data.id;
			datasetContext.updateOriginal(dataset);
			route.params.datasetContext.setState({dataset, wasValid: dataset.isValid()});
			if (wasNew) {
				datasetsContext.state.datasets.push(dataset);
			} else {
				const idx = datasetsContext.state.datasets.findIndex(item => item.id === dataset.id);
				datasetsContext.state.datasets[idx] = dataset;
			}
			datasetsContext.setState({datasets: datasetsContext.state.datasets})
			if (wasNew) {
				navigation.navigate('DataData', route.params);
			}
		}).finally(() => {
			this.setState({ saving: false });
		});
	}

	render() {
		const dataset = this.props.route.params.datasetContext.state.dataset;
		const { navigation, route } = this.props;

		return (
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{flex: 1}}
				keyboardVerticalOffset={Platform.select({ios: 65, android: 130})}
			>
				<View style={{flex: 1}}>

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
								// onSubmitEditing={() => refInputs[1].focus()}
							/>
							<IconSelector
								title={I18n.t('field.icon')}
								defaultValue={dataset.icon}
								rightElement={() => (
									<Text style={{opacity: 0.3}}>{dataset.icon.substring(4).toUpperCase()}</Text>
								)}
								onChange={value => {dataset.icon = value; this.setState({dataset});}}
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
								onPress={() => navigation.push('NotesColumnEdit', { ...route.params, column, datasetSettingsContext: this })}
								delayPressIn={0}
								rightElement={() => (
									<Text style={{opacity: 0.3}}>{column.lang.toUpperCase()}</Text>
								)}
								topDivider={columnIdx === 0}
								bottomDivider
								chevron
							/>
						))}
						<View style={{marginHorizontal: 10, marginVertical: 15}}>
							<Button mode={'outlined'} onPress={() => this.handleAddColumn()}>{I18n.t('btn.addColumn')}</Button>
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
					</ScrollView>

					<View style={{flex: 0, marginHorizontal: 10, marginBottom: 10}}>
						<Divider style={{marginBottom: 10}} />
						<Button mode={'contained'} onPress={() => this.save()} loading={this.state.saving} disabled={!dataset.isValid() || !route.params.datasetContext.hasDifferences(dataset) || this.state.saving}>
							{I18n.t('btn.save')}
						</Button>
					</View>
				</View>
			</KeyboardAvoidingView>
		);
	}
}
