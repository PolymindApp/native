import React from 'react';
import {ActivityIndicator, Dimensions, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Icon, SearchBar} from "react-native-elements";
import I18n from "../../../locales/i18n";
import {ScrollView} from "react-native-gesture-handler";
import {Row, Table} from "react-native-table-component";
import {FAB} from "react-native-paper";
import { THEME, Dataset, DatasetService } from '@polymind/sdk-js';

export default class DataScreenData extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			search: '',
			dataset: props.route.params.dataset,
		};
	}

	_onRowSave(row) {
		const dataset = this.state.dataset;
		const clone = new Dataset(Helpers.deepClone(dataset));
		if (row.id) {
			const idx = clone.rows.findIndex(item => item.id === row.id);
			Object.assign(clone.rows[idx], row);
		} else {
			clone.rows.push(row);
		}
		const transactions = clone.getTransactions(this.state.originalDataset);
		return DatasetService.save(transactions).then(response => {
			dataset.applyTransactionResponse(response);
			this.props.route.params.updateOriginal(dataset);
			this.setState({ dataset });
			return row;
		});
	}

	_onRowRemove(row) {
		const dataset = this.state.dataset;
		const clone = new Dataset(Helpers.deepClone(dataset));
		const idx = clone.rows.findIndex(item => item.id === row.id);
		clone.rows.splice(idx, 1);
		const transactions = clone.getTransactions(this.state.originalDataset);
		return DatasetService.save(transactions).then(response => {
			this.props.route.params.updateOriginal(clone);
			this.setState({ dataset: clone });
			return response;
		});
	}

	updateSearch = search => {
		this.setState({ search });
	};

	onRefresh() {
		this.setState({ refreshing: true });
		this.props.route.params.load().finally(() => this.setState({ refreshing: false }));
	}

	filteredRows() {
		return this.state.dataset.rows.filter(row => {
			const found = false;
			for (let i = 0; i < row.cells.length; i++) {
				const cell = row.cells[i];
				if ((cell.text || '').trim().toLowerCase().indexOf(this.state.search) !== -1) {
					return true;
				}
			}
			return found;
		});
	}

	tableData() {
		const data = {
			header: [],
			width: [],
			rows: [],
		};

		data.header.push('Key');
		data.width.push(40);

		let width = Dimensions.get('window').width;
		if (this.state.dataset.columns.length > 1) {
			width = width / 2;
		}

		this.state.dataset.columns.forEach((column, columnIdx) => {
			data.header.push(column.name);
			data.width.push(width);
		});

		this.filteredRows().forEach((row, rowIdx) => {
			const item = [];
			item.push(row.id);
			this.state.dataset.columns.forEach((column, columnIdx) => {
				item.push(row.cells[columnIdx].text);
			});
			data.rows.push(item);
		});

		if (this.state.dataset.columns.length > 1) {
			data.width[1] -= 20;
			data.width[2] -= 20;
		} else {
			data.width[1] -= 20;
		}

		return data;
	}

	render() {
		const tableData = this.tableData();
		const dataset = this.state.dataset;
		const { navigation } = this.props;

		return (
			<View style={{flex: 1}}>
				{dataset.rows.length === 0 ? (
					this.state.refreshing ? (
						<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
							<ActivityIndicator size="large" color={THEME.primary} />
						</View>
					) : (
						<View style={{flex: 1, paddingHorizontal: 60, opacity: 0.5, alignItems: 'center', justifyContent: 'center'}}>
							<Icon name={'file-question'} size={64}></Icon>
							<Text style={{textAlign: 'center'}} h4>{I18n.t('error.noData')}</Text>
						</View>
					)
				) : (
					<View style={{flex: 1}}>
						<SearchBar placeholder={I18n.t('input.filter')} cancelButtonTitle={I18n.t('btn.cancel')} cancelButtonProps={{ color: THEME.primary, buttonStyle: { marginTop: -7 } }} onChangeText={this.updateSearch} value={this.state.search} platform={Platform.OS === 'ios' ? 'ios' : 'android'} />

						<ScrollView horizontal={true} enabled={dataset.columns.length > 2} >
							<View>
								<Table borderStyle={{borderWidth: 1, borderLeftWidth: 0, borderColor: '#bbb'}}>
									<Row data={tableData.header} widthArr={tableData.width} style={styles.header} textStyle={styles.text}/>
								</Table>
								<ScrollView style={styles.dataWrapper} keyboardShouldPersistTaps={'handled'} refreshControl={
									<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh.bind(this)} />
								}>
									<Table borderStyle={{borderWidth: 1, borderLeftWidth: 0, borderColor: '#ddd'}}>
										{tableData.rows.map((row, rowIdx) => (
											<TouchableOpacity
												key={rowIdx}
												delayPressIn={0}
												style={[styles.row, rowIdx % 2 && {backgroundColor: 'rgba(27, 141, 138, 0.05)'}]}
												onPress={() => navigation.push('NotesDataEdit', { index: rowIdx, dataset: dataset, onSave: row => this._onRowSave(row), onRemove: row => this._onRowRemove(row), })}
											>
												<Row
													data={row}
													borderStyle={{borderWidth: 1, borderColor: '#ddd'}}
													widthArr={tableData.width}
													textStyle={styles.text}
												/>
											</TouchableOpacity>
										))}
									</Table>
								</ScrollView>
							</View>
						</ScrollView>
					</View>
				)}

				<View style={styles.fixedView}>
					<TouchableOpacity
						activeOpacity={0.8}
						onPress={() => this.add()}
						delayPressIn={0}
					>
						<FAB
							color={'white'}
							icon="plus"
							style={{backgroundColor: THEME.primary}}
						/>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	fixedView : {
		position: 'absolute',
		right: 30,
		bottom: 30,
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	fab: {
		backgroundColor: THEME.primary,
	},

	header: { backgroundColor: '#ccc' },
	text: { textAlign: 'left', padding: 5 },
	dataWrapper: {  },
	row: { backgroundColor: 'white' }
});
