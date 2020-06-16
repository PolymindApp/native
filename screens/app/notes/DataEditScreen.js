import React from 'react'
import {
	ActionSheetIOS, ActivityIndicator,
	Alert,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	StyleSheet, TouchableOpacity,
	TouchableWithoutFeedback,
	View
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PolymindSDK, { THEME, DatasetRow, DatasetCell } from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';
import { Divider, Icon, Input, Text} from "react-native-elements";
import {Button, IconButton, Menu} from "react-native-paper";
import ContextualOptions from "../../../components/ContextualOptions";

const $polymind = new PolymindSDK();

export default class DataEditScreen extends React.Component {

	state = {
		fields: [],
		refInputs: [],
		optionsMenu: false,
		autofocus: true,
		deleting: false,
		saving: false,
		row: new DatasetRow()
	};

	optionItems = [
		{ name: I18n.t('btn.cancel'), callback: () => {}, cancel: true, android: false },
		{ icon: 'delete', name: I18n.t('btn.delete'), callback: () => {

				const { route, navigation } = this.props;
				const { dataset, index } = route.params;
				const row = this.state.row;
				if (!row.id) {
					route.params.onRemove(row).then(() => {
						navigation.pop();
					});
				} else {
					this.setState({ deleting: true });
					route.params.onRemove(row).then(() => {
						dataset.rows.splice(index, 1);
						if (dataset.rows.length <= index) {
							this.props.route.params.index--;
						}
						if (dataset.rows.length === 0) {
							navigation.pop();
						} else {
							this.prepare();
							this.setState({ deleting: false });
						}
					});
				}
			}, destructive: true },
	]

	getRow(newRow = false) {
		const { dataset, index } = this.props.route.params;
		let row = dataset.rows[index];

		if (!row || newRow) {
			row = new DatasetRow();
			dataset.columns.forEach(column => {
				row.cells.push(new DatasetCell());
			});
		}
		return row;
	}

	save(addMore = false) {
		const { navigation, route } = this.props;
		const row = this.state.row;

		this.setState({ saving: true, autofocus: addMore });
		route.params.dataset.columns.forEach((column, columnIdx) => {
			row.cells[columnIdx].text = this.state.fields[columnIdx];
		});
		route.params.onSave(row).then(model => {

			const moreState = {};
			if (addMore) {
				this.props.route.params.index++;
				this.prepare(true);
			}
			this.setState({ saving: false, autofocus: addMore });
			addMore && this.state.refInputs[0].focus();
		});
	}

	prepare(newRow = false) {
		const { navigation } = this.props;
		const { dataset } = this.props.route.params;
		const fields = [];
		const refInputs = [];
		let row = this.getRow(newRow);
		dataset.columns.forEach((column, columnIdx) => {
			fields.push(row.cells[columnIdx].text);
			refInputs.push(React.createRef());
		});

		this.setState({ fields, refInputs, row, autofocus: row.id === null });
	}

	showIOSOptions(items) {
		const iosItems = items.filter(item => item.ios !== false);
		const texts = iosItems.map(item => item.name);
		const destructiveButtonIndex = iosItems.findIndex(item => item.destructive);
		const cancelButtonIndex = iosItems.findIndex(item => item.cancel);

		ActionSheetIOS.showActionSheetWithOptions({
			options: texts,
			destructiveButtonIndex,
			cancelButtonIndex
		}, buttonIndex => {
			items[buttonIndex].callback(this.props);
		});
	}

	componentDidMount() {
		const { navigation } = this.props;
		this._navigationFocus = navigation.addListener('focus', () => {
			this.prepare();
		});
		setTimeout(() => {
			this.setState({ autofocus: false });
		});
	}

	componentWillUnmount() {
		this._navigationFocus();
	}

	previous() {
		const { dataset, index } = this.props.route.params;
		const { navigation } = this.props;

		let newIndex = index - 1;
		if (newIndex < 0) {
			newIndex = dataset.rows.length - 1;
		}

		this.props.route.params.index = newIndex;
		this.prepare();
	}

	next() {
		const { dataset, index } = this.props.route.params;
		const { navigation } = this.props;

		let newIndex = index + 1;
		if (newIndex > dataset.rows.length - 1) {
			newIndex = 0;
		}

		this.props.route.params.index = newIndex;
		this.prepare();
	}

	hasDifferences() {
		const { route } = this.props;

		let atLeastOneValue = false;
		for (let i = 0; i < this.state.fields.length; i++) {
			if ((this.state.fields[i] || '').trim() !== '') {
				atLeastOneValue = true;
				break;
			}
		}
		if (!atLeastOneValue) {
			return false;
		}

		const row = this.state.row;
		for (let i = 0; i < row.cells.length; i++) {
			const cell = row.cells[i];
			if (cell.text !== this.state.fields[i]) {
				return true;
			}
		}
		return false;
	}

	translate(fieldIdx) {

	}

	speechToText(fieldIdx) {

	}

	render() {
		const { navigation } = this.props;
		const { dataset } = this.props.route.params;
		const row = this.state.row;

		if (this.state.deleting) {
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
					<Text style={{marginTop: 10, color: THEME.primary}}>{I18n.t('state.deleting')}</Text>
				</View>
			);
		}

		navigation.setOptions({
			title: row.id
				? I18n.t('title.notesDataEdit', { id: row.id })
				: I18n.t('title.notesDataEditNew'),
			headerRight: row.id ? () => (
				<View style={{marginRight: 10, flexDirection: 'row'}}>
					<ContextualOptions items={this.optionItems} />
				</View>
			) : null
		});

		return (
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{flex: 1}}
			>
				<View style={{flex: 1}}>
					<ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>
						{this.state.fields.map((field, fieldIdx) => (
							<View key={dataset.columns[fieldIdx].guid} style={{marginHorizontal: 10, borderRadius: 10, padding: 5, paddingTop: 15, backgroundColor: 'white', marginBottom: this.state.fields.length - 1 === fieldIdx ? 15 : 10}}>
								<Input
									autoFocus={this.state.autofocus && fieldIdx === 0}
									label={
										<View style={{flexDirection: 'row', alignItems: 'center'}}>
											<Icon name={'circle'} size={12} color={THEME.primary} style={{marginRight: 10}} />
											<Text>{dataset.columns[fieldIdx].name}</Text>
										</View>
									}
									placeholder={I18n.t('field.dataPlaceholder')}
									inputStyle={{color:THEME.primary}}
									defaultValue={row.cells[fieldIdx].text}
									onChangeText={value => {this.state.fields[fieldIdx] = value; this.setState({ fields: this.state.fields });}}
									returnKeyType = {fieldIdx === dataset.columns.length - 1 ? 'done' : "next"}
									ref={ref => { this.state.refInputs[fieldIdx] = ref }}
									autoCapitalize={'sentences'}
									spellCheck={true}
									renderErrorMessage={false}
									rightIcon={
										<View style={{flexDirection: 'row'}}>
											<IconButton icon={'translate'} color={THEME.primary} onPress={() => this.translate(fieldIdx)} delayPressIn={0} />
											<IconButton icon={'microphone'} color={THEME.primary} onPress={() => this.speechToText(fieldIdx)} delayPressIn={0} />
										</View>
									}
									onSubmitEditing={() => {
										if (fieldIdx === dataset.columns.length - 1) {
											this.save(true);
										} else {
											this.state.refInputs[fieldIdx + 1].focus();
										}
									}}
								/>
								<View style={{padding: 10}}>
									<Text style={{color: THEME.error}}>Did you mean:</Text>
								</View>
							</View>
						))}
					</ScrollView>

					<View style={{flexDirection: 'row', padding: 5, alignItems: 'center'}}>
						<IconButton icon={'chevron-left'} type={'clear'} onPress={() => this.previous()} delayPressIn={0} disabled={dataset.rows.length <= 1} />
						<View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
							<Button style={{flex: 1}} mode="contained" loading={this.state.saving} onPress={() => this.save(row.id ? false : true)} disabled={!row.isValid() || !this.hasDifferences()}>
								{I18n.t(row.id ? 'btn.save' : 'btn.add')}
							</Button>
						</View>
						<IconButton icon={'chevron-right'} type={'clear'} onPress={() => this.next()} delayPressIn={0} disabled={dataset.rows.length <= 1} />
					</View>
				</View>
			</KeyboardAvoidingView>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 15,
	},
});
