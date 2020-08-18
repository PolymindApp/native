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

export default class DataSettingsScreen extends React.Component {

	state = {
		ready: false,
		saving: false,
	}

	componentDidMount() {
		const dataset = this.props.route.params.datasetContext.state.dataset;
		this.setState({ dataset, ready: true });
	}

	handleAddColumn() {
		const dataset = this.props.route.params.datasetContext.state.dataset;
		const column = new DatasetColumn({ dataset: dataset.id });
		this.props.navigation.push('NotesColumnEdit', { ...this.props.route.params, column, datasetSettingsContext: this});
	}

	onColumnSave(column, guidAlreadyExists) {
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
					global.mustRefreshSession = true;
					return callback(model, !column.id);
				});
			} else {
				callback(column, !guidAlreadyExists);
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
			column.id ? DatasetColumnService.remove(column.id).then(() => {
				global.mustRefreshSession = true;
				callback();
			}) : callback();
		});
	}

	save() {
		const { navigation, route } = this.props;
		const datasetContext = route.params.datasetContext;
		const datasetsContext = route.params.datasetsContext;
		const dataset = this.state.dataset;
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
			datasetContext.setState({ dataset });
			datasetContext.updateOriginal(dataset);
			route.params.datasetContext.setState({dataset, wasValid: dataset.isValid()});
			if (wasNew) {
				datasetsContext.state.datasets.push(dataset);
				global.mustRefreshSession = true;
			} else {
				const idx = datasetsContext.state.datasets.findIndex(item => item.id === dataset.id);
				datasetsContext.state.datasets[idx] = dataset;
			}
			datasetsContext.setState({datasets: datasetsContext.state.datasets});
			if (wasNew) {
				navigation.navigate('DataData', route.params);
			}
		}).catch(err => {
			console.log(err);
		}).finally(() => {
			this.setState({ saving: false });
		});
	}

	render() {
		const dataset = this.state.dataset;
		const { navigation, route } = this.props;

		if (!this.state.ready) {
			return null;
		}

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
								clearButtonMode={'always'}
								autoFocus={!dataset.id}
								label={I18n.t('field.name')}
								placeholder={I18n.t('field.dataPlaceholder')}
								inputStyle={{color:THEME.primary}}
								inputContainerStyle={{borderBottomWidth: 0}}
								defaultValue={dataset.name}
								renderErrorMessage={false}
								onChangeText={value => {dataset.name = value; this.setState({dataset});}}
								returnKeyType = {"next"}
								ref={ref => { refInputs[0] = ref }}
								// onSubmitEditing={() => refInputs[1].focus()}
							/>
						</View>

						<List.Subheader style={{marginTop: 15}}>{I18n.t('dataset.settings.columns')}</List.Subheader>
						{dataset.columns.length === 0 ? (
							<View style={{marginHorizontal: 10, padding: 10, backgroundColor: THEME.warning, borderRadius: 5, flexDirection: 'row', alignItems: 'center'}}>
								<Icon name={'alert'} style={{marginRight: 10}} />
								<Text style={{flex: 1, flexWrap: 'wrap'}}>{I18n.t('dataset.settings.noColumnWarn')}</Text>
							</View>
						) : (
							<View style={{marginTop: 10, marginHorizontal: 10, padding: 10, backgroundColor: 'white', borderRadius: 10}}>
								{dataset.columns.map((column, columnIdx) => (
									<ListItem
										key={column.guid}
										title={column.name}
										onPress={() => navigation.push('NotesColumnEdit', { ...route.params, column, datasetSettingsContext: this })}
										delayPressIn={0}
										rightElement={() => (
											<Text style={{opacity: 0.3}}>{column.lang.toUpperCase()}</Text>
										)}
										topDivider={columnIdx > 0}
										chevron
									/>
								))}

								<View style={{marginTop: 10}}>
									<Button mode={'outlined'} onPress={() => this.handleAddColumn()}>{I18n.t('btn.addColumn')}</Button>
								</View>
							</View>
						)}

						<View style={{marginVertical: 10, marginTop: 15}}>
							<List.Subheader>{I18n.t('dataset.settings.others')}</List.Subheader>

							<View style={{margin: 10, padding: 10, backgroundColor: 'white', borderRadius: 10}}>
								<ListItem
									title={I18n.t('dataset.settings.includeImage')}
									checkmark={dataset.include_image}
									delayPressIn={0}
									onPress={() => {
										dataset.include_image = !dataset.include_image;
										this.setState({ dataset });
									}}
								/>
								<IconSelector
									defaultValue={dataset.icon}
									leftElement={() => (
										<View>
											<Text>{I18n.t('field.icon')} :</Text>
											<Text style={{opacity: 0.3}}>
												{dataset.icon.substring(4).toUpperCase().substring(0, 15)}
											</Text>
										</View>
									)}
									onChange={value => {dataset.icon = value; this.setState({dataset});}}
								/>
							</View>
						</View>
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
