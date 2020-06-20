import React from 'react';
import {ActivityIndicator, Dimensions, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Icon, SearchBar} from "react-native-elements";
import I18n from "../../../locales/i18n";
import {ScrollView} from "react-native-gesture-handler";
import {Row, Table} from "react-native-table-component";
import {FAB} from "react-native-paper";
import { THEME } from '@polymind/sdk-js';

export default class DataScreenData extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			search: '',
		};
	}

	updateSearch = search => {
		this.setState({ search });
	};

	onRefresh() {
		this.setState({ refreshing: true });
		this.props.route.params.datasetContext.load().finally(() => this.setState({ refreshing: false }));
	}

	filteredRows() {
		const dataset = this.props.route.params.datasetContext.state.dataset;
		return dataset.rows.filter(row => {
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

	getRowParams(index) {
		const { route } = this.props;
		const dataset = this.props.route.params.datasetContext.state.dataset;
		return {
			dataset,
			index,
			onSave: row => {
				return route.params.onRowSave(row).then(() => {
					if (row.id) {
						const idx = dataset.rows.findIndex(item => item.id === row.id);
						Object.assign(dataset.rows[idx], row);
					} else {
						dataset.rows.push(row);
					}
					this.setState({ dataset });
				});
			},
			onRemove: row => route.params.onRowRemove.bind(this),
		}
	}

	add() {
		const { route, navigation } = this.props;
		navigation.push('NotesDataEdit', {...route.params, rowIdx: route.params.datasetContext.state.dataset.rows.length, datasetDataContext: this});
	}

	tableData() {
		const dataset = this.props.route.params.datasetContext.state.dataset;
		const statusSize = 30;
		const data = {
			header: [],
			width: [],
			rows: [],
		};

		data.header.push('');
		data.width.push(statusSize);

		let width = Dimensions.get('window').width;
		if (dataset.columns.length > 1) {
			width = width / 2;
		}

		dataset.columns.forEach((column, columnIdx) => {
			data.header.push(column.name);
			data.width.push(width);
		});

		this.filteredRows().forEach((row, rowIdx) => {
			const item = [];
			item.push(<Icon name={'circle'} size={12} color={THEME.primary} />);
			dataset.columns.forEach((column, columnIdx) => {
				item.push(row.cells[columnIdx].text);
			});
			data.rows.push(item);
		});

		if (dataset.columns.length > 1) {
			data.width[1] -= (statusSize / 2) + 1;
			data.width[2] -= (statusSize / 2) + 1;
		} else {
			data.width[1] -= statusSize + 1;
		}

		return data;
	}

	render() {
		const tableData = this.tableData();
		const dataset = this.props.route.params.datasetContext.state.dataset;
		const { navigation, route } = this.props;

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
						<SearchBar placeholder={I18n.t('input.filter')} cancelButtonTitle={I18n.t('btn.cancel')} cancelButtonProps={{ color: THEME.primary, buttonStyle: { marginTop: -3 } }} onChangeText={this.updateSearch} value={this.state.search} platform={Platform.OS === 'ios' ? 'ios' : 'android'} />

						<ScrollView horizontal={true} enabled={dataset.columns.length > 2} >
							<View>
								<Table borderStyle={{borderWidth: 1, borderLeftWidth: 0, borderColor: '#ccc'}}>
									<Row data={tableData.header} widthArr={tableData.width} style={styles.header} textStyle={styles.text}/>
								</Table>
								<ScrollView style={styles.dataWrapper} keyboardShouldPersistTaps={'handled'} refreshControl={
									<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh.bind(this)} />
								}>
									<Table borderStyle={{borderWidth: 1, borderLeftWidth: 0, borderColor: '#ddd'}}>
										{tableData.rows.map((row, rowIdx) => (
											<TouchableOpacity
												key={rowIdx}
												hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
												delayPressIn={0}
												style={[styles.row, rowIdx % 2 && {backgroundColor: 'rgba(27, 141, 138, 0.05)'}]}
												onPress={() => navigation.push('NotesDataEdit', {...route.params, rowIdx, datasetDataContext: this})}
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
						hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
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

	header: { backgroundColor: '#eee' },
	text: { textAlign: 'left', padding: 5 },
	dataWrapper: {  },
	row: { backgroundColor: 'white' }
});
