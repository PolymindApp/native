import React from 'react'
import {ActivityIndicator, TouchableHighlight, Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PolymindSDK, { THEME, Helpers, Dataset, DatasetRow, DatasetRowService, DatasetCell, DatasetService, SpellCheckService, TranslateService, GoogleService } from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';
import {Divider, Icon, Input, SearchBar, Text} from "react-native-elements";
import {Button, IconButton, Menu} from "react-native-paper";
import ContextualOptions from "../../../components/ContextualOptions";

const $polymind = new PolymindSDK();
let checkServiceTimeout;
let lastCheckServiceFieldContent = '';

export default class DataEditScreen extends React.Component {

	state = {
		fields: [],
		optionsMenu: false,
		autofocus: true,
		deleting: false,
		saving: false,
		row: new DatasetRow(),
		spellCheckFields: [],
		translationFields: [],
		fetching: false,
		fetchingCustom: false,
		canFetchImages: false,
		imageOffset: 0,
		images: [],
		lastSearchQuery: null,
		searchQueryContext: '',
		searchImageQuery: '',
		tags: [],
		allTags: ['verb', 'noun'],
		addTagInput: '',
	};

	refInputs = [];
	refTagInput = React.createRef();

	optionItems = [
		{ name: I18n.t('btn.cancel'), callback: () => {}, cancel: true, android: false },
		{ icon: 'delete', name: I18n.t('btn.delete'), callback: () => {

				const { route, navigation } = this.props;
				const { dataset } = this.props.route.params.datasetContext.state;
				const { rowIdx } = route.params;
				const row = this.state.row;

				if (!row.id) {
					this.onRowRemove(row).then(() => {
						navigation.pop();
					});
				} else {
					this.setState({ deleting: true });
					this.onRowRemove(row).then(() => {
						if (dataset.rows.length <= rowIdx) {
							this.props.route.params.rowIdx--;
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
		const { dataset } = this.props.route.params.datasetContext.state;
		const { rowIdx } = this.props.route.params;
		let row = dataset.rows[rowIdx];

		if (!row || newRow) {
			row = new DatasetRow();
			dataset.columns.forEach(column => {
				row.cells.push(new DatasetCell());
			});
		}
		return row;
	}

	onRowRemove(row) {
		const { datasetContext, datasetDataContext } = this.props.route.params;
		const { dataset } = datasetContext.state;

		const idx = dataset.rows.findIndex(item => item.id === row.id);
		dataset.rows.splice(idx, 1);

		return DatasetRowService.remove(row.id).then(response => {
			datasetContext.updateOriginal(dataset);
			datasetDataContext.setState({ dataset });
			return response;
		});
	}

	save(addMore = false) {
		const { navigation, route } = this.props;
		const { datasetContext, datasetDataContext } = this.props.route.params;
		const { dataset, originalDataset } = datasetContext.state;
		const { rowIdx } = route.params;
		const row = this.state.row;

		this.setState({ saving: true, autofocus: addMore });
		dataset.columns.forEach((column, columnIdx) => {
			row.cells[columnIdx].text = this.state.fields[columnIdx];
		});

		const clone = new Dataset(Helpers.deepClone(dataset));

		if (row.id) {
			clone.rows[rowIdx] = row;
		} else {
			clone.rows.push(row);
		}

		const transactions = clone.getTransactions(originalDataset);

		this.setState({ saving: true });
		DatasetService.save(transactions).then(response => {

			dataset.applyTransactionResponse(response);
			datasetContext.updateOriginal(dataset);
			datasetDataContext.setState({dataset});

			const moreState = {};
			if (addMore) {
				this.props.route.params.rowIdx++;
				this.prepare(true);
			}
			this.setState({ saving: false, autofocus: addMore });
			addMore && this.refInputs[0].focus();
		});
	}

	prepare(newRow = false) {
		const { navigation } = this.props;
		const { dataset } = this.props.route.params.datasetContext.state;
		const fields = [];
		const refInputs = [];
		let row = this.getRow(newRow);
		dataset.columns.forEach((column, columnIdx) => {
			fields.push(row.cells[columnIdx].text || '');
			refInputs.push(React.createRef());
		});

		this.setState({ fields, row, autofocus: row.id === null });
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
		const { dataset } = this.props.route.params.datasetContext.state;
		const { rowIdx } = this.props.route.params;
		const { navigation } = this.props;

		let newIndex = rowIdx - 1;
		if (newIndex < 0) {
			newIndex = dataset.rows.length - 1;
		}

		this.props.route.params.rowIdx = newIndex;
		this.prepare();
	}

	next() {
		const { dataset } = this.props.route.params.datasetContext.state;
		const { rowIdx } = this.props.route.params;
		const { navigation } = this.props;

		let newIndex = rowIdx + 1;
		if (newIndex > dataset.rows.length - 1) {
			newIndex = 0;
		}

		this.props.route.params.rowIdx = newIndex;
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

	checkServices(fieldIdx, delay = 1000) {

		clearTimeout(checkServiceTimeout);
		checkServiceTimeout = setTimeout(() => {
			const { spellCheckFields } = this.state;
			if (this.state.fields[fieldIdx].toLowerCase() === lastCheckServiceFieldContent || !this.state.fields[fieldIdx] || this.state.fields[fieldIdx].length < 3) {
				spellCheckFields[fieldIdx] = false;
				this.setState({ spellCheckFields });
				return;
			}
			lastCheckServiceFieldContent = this.state.fields[fieldIdx].toLowerCase();

			this.fetchSpellChecking(fieldIdx).then(spellCheck => {

				spellCheckFields[fieldIdx] = spellCheck;

				if (!spellCheck) {
					this.fetchTranslations(fieldIdx).then(translationFields => {
						this.setState({ spellCheckFields, translationFields });
					});
				} else {
					this.setState({ spellCheckFields });
				}
			});
		}, delay);
	}

	fetchSpellChecking(fieldIdx) {
		const text = this.state.fields[fieldIdx].trim();
		const dataset = this.props.route.params.datasetContext.state.dataset;
		const locale = dataset.columns[fieldIdx].lang;

		return new Promise((resolve, reject) => {
			return SpellCheckService.check(text, locale).then(tokens => {

				if (!tokens) {
					resolve(false);
				}

				let offset = 0;
				const item = {
					original: text,
					suggestion: '',
					parts: [],
				};
				tokens.forEach((token, tokenIdx) => {
					const suggestion = token.suggestions[0].suggestion;
					const start = token.offset;
					const end = start + token.token.length;

					if (start > offset) {
						const rest = text.substring(offset, start);
						item.suggestion += rest;
						item.parts.push(<Text key={tokenIdx + rest} style={{marginLeft: 3}}>{rest}</Text>);
					}

					item.suggestion += suggestion;
					item.parts.push(<Text key={tokenIdx + suggestion} style={{color: THEME.success, fontWeight: 'bold', marginLeft: tokenIdx > 0 ? 3 : 0}}>{suggestion}</Text>);
					offset = end;
				});

				if (offset < text.length) {
					const rest = text.substring(offset);
					item.suggestion += rest;
					item.parts.push(<Text key={'ending' + rest} style={{marginLeft: 3}}>{rest}</Text>);
				}

				const result = item.parts.length > 0 && item.suggestion.toLowerCase() !== this.state.fields[fieldIdx].toLowerCase() ? item : false;
				resolve(result);
			});
		});
	}

	fetchTranslations(fieldIdx) {

		return new Promise((resolve, reject) => {
			const translationFields = [];
			for (let i = 0; i < this.state.fields.length; i++) {
				translationFields[i] = false;
			}
			if (this.state.fields.length <= 1) {
				return resolve(translationFields);
			}

			const text = this.state.fields[fieldIdx].trim();
			const dataset = this.props.route.params.datasetContext.state.dataset;
			const fromLocale = dataset.columns[fieldIdx].lang;

			let toLocales = []
			for (let i = 0; i < this.state.fields.length; i++) {
				if (i !== fieldIdx) {
					toLocales.push(dataset.columns[i].lang);
				}
			}

			return TranslateService.translate(text, fromLocale, toLocales).then(propositions => {
				propositions.forEach(proposition => {
					const idx = dataset.columns.findIndex(column => column.lang === proposition.to);
					if (proposition.text.toLowerCase() !== this.state.fields[idx].toLowerCase()) {
						translationFields[idx] = proposition.text;
					}
				});
				return resolve(translationFields);
			});
		});
	}

	fetchImages(query, locale, customQuery = false) {

		this.setState({ fetching: !customQuery, fetchingCustom: customQuery });
		return GoogleService.fetchImages(query, locale, {
			start: this.state.imageOffset + 1,
			num: 9,
		})
			.then(response => response.items.map(item => item.image.thumbnailLink))
			.then(items => {

				let images = this.state.lastSearchQuery === query ? this.state.images : [];
				images = images.concat(items);

				this.setState({ images, lastSearchQuery: query, imageOffset: this.state.imageOffset + 9, canFetchImages: images.length < 27 });
			}).finally(() => this.setState({ fetching: false, fetchingCustom: false }));
	}

	applyValue(fieldIdx, value, fetchServices = false, fetchServicesDelay = 1000) {
		const { fields, spellCheckFields, translationFields } = this.state;

		if (!spellCheckFields[fieldIdx] || spellCheckFields[fieldIdx].suggestion.toLowerCase() === value.toLowerCase()) {
			spellCheckFields[fieldIdx] = false;
		}
		if (!translationFields[fieldIdx] || translationFields[fieldIdx].toLowerCase() === value.toLowerCase()) {
			translationFields[fieldIdx] = false;
		}

		if (!value) {
			for (let i = 0; i < this.state.fields.length; i++) {
				if (i !== fieldIdx) {
					translationFields[i] = false;
				}
			}
		}

		fields[fieldIdx] = value.substring(0, 1).toUpperCase() + value.substring(1);
		this.setState({ fields, spellCheckFields, translationFields });

		if (fetchServices) {
			this.checkServices(fieldIdx, fetchServicesDelay);
		}
	}

	pushTag(tag) {
		const allIdx = this.state.allTags.indexOf(tag);
		const idx = this.state.tags.indexOf(tag);
		if (allIdx === -1) {
			this.state.allTags.push(tag);
		}
		if (idx === -1) {
			this.state.tags.push(tag);
		}
		this.setState({ tags: this.state.tags, allTags: this.state.allTags, addTagInput: '' });
	}

	toggleTag(tag) {
		const idx = this.state.tags.indexOf(tag);
		if (idx === -1) {
			this.state.tags.push(tag);
		} else {
			this.state.tags.splice(idx, 1);
		}
		this.setState({ tags: this.state.tags });
	}

	render() {
		const { navigation, route } = this.props;
		const { rowIdx } = route.params;
		const { dataset } = this.props.route.params.datasetContext.state;
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
				? I18n.t('title.notesDataEdit', { index: rowIdx + 1, total: dataset.rows.length })
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
						{this.state.fields.map((field, fieldIdx) => {
							const spellCheck = this.state.spellCheckFields[fieldIdx];
							const translation = this.state.translationFields[fieldIdx];
							return (
								<View key={dataset.columns[fieldIdx].guid} style={{marginHorizontal: 10, borderRadius: 10, paddingVertical: 10, backgroundColor: 'white', marginBottom: 10}}>
									<Input
										clearButtonMode={'always'}
										autoFocus={this.state.autofocus && fieldIdx === 0}
										inputContainerStyle={{borderBottomWidth: 0}}
										label={
											<View style={{flexDirection: 'row', alignItems: 'center'}}>
												<Icon name={'circle'} size={12} color={THEME.primary} style={{marginRight: 10}} />
												<Text style={{flex: 1}}>{dataset.columns[fieldIdx].name}</Text>
												<Text style={{opacity: 0.3}}>{dataset.columns[fieldIdx].lang.toUpperCase()}</Text>
											</View>
										}
										placeholder={I18n.t('field.dataPlaceholder')}
										inputStyle={{color:THEME.primary}}
										defaultValue={row.cells[fieldIdx].text}
										value={this.state.fields[fieldIdx]}
										onChangeText={value => {
											this.checkServices(fieldIdx)
											this.applyValue(fieldIdx, value, true);
										}}
										returnKeyType = {fieldIdx === dataset.columns.length - 1 ? 'done' : "next"}
										ref={ref => { this.refInputs[fieldIdx] = ref }}
										autoCapitalize={'sentences'}
										spellCheck={true}
										renderErrorMessage={false}
										// rightIcon={
										// 	<View style={{flexDirection: 'row'}}>
										// 		<IconButton icon={'microphone'} color={THEME.primary} onPress={() => this.speechToText(fieldIdx)} delayPressIn={0} />
										// 	</View>
										// }
										onSubmitEditing={() => {
											if (fieldIdx === dataset.columns.length - 1) {
												this.save(true);
											} else {
												this.refInputs[fieldIdx + 1].focus();
											}
										}}
									/>
									{(spellCheck || translation) && (
										<View style={{padding: 10, paddingBottom: 0}}>
											{spellCheck && (
												<View style={{flexDirection: 'row', alignItems: 'center'}}>
													<Text style={{color: THEME.error, marginRight: 10}}>
														{I18n.t('dataset.data.edit.didYouMean')}
													</Text>
													<TouchableOpacity
														hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
														style={{padding: 5, borderRadius: 5, backgroundColor: '#eee', flexDirection: 'row'}}
														onPress={() => this.applyValue(fieldIdx, spellCheck.suggestion, true, 0)}
													>
														{spellCheck.parts.map((part, partIdx) => part)}
													</TouchableOpacity>
												</View>
											)}
											{translation && (
												<View style={{flexDirection: 'row', alignItems: 'center'}}>
													<Text style={{color: THEME.error, marginRight: 10}}>
														{I18n.t('dataset.data.edit.possibleTranslation')}
													</Text>
													<TouchableOpacity
														hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
														style={{padding: 5, borderRadius: 5, backgroundColor: '#eee'}}
														onPress={() => this.applyValue(fieldIdx, translation)}
													>
														<Text>{translation}</Text>
													</TouchableOpacity>
												</View>
											)}
										</View>
									)}
								</View>
							);
						})}

						<View style={{marginHorizontal: 10, borderRadius: 10, padding: 10, backgroundColor: 'white', marginBottom: 10 }}>
							<View style={{flexDirection: 'row', alignItems: 'center'}}>
								<Icon name={'image'} color={THEME.primary} style={{marginRight: 5}} />
								<Text style={{flex: 1}}>{I18n.t('dataset.data.edit.image')}</Text>
							</View>

							<Text style={{marginTop: 5, opacity: 0.5}}>
								{I18n.t('dataset.data.edit.imageDesc')}
							</Text>

							<Input
								clearButtonMode={'while-editing'}
								underlineColorAndroid={'transparent'}
								inputContainerStyle={{marginHorizontal: -10, borderBottomWidth: 0}}
								placeholder={I18n.t('input.searchCloud')}
								inputStyle={{color:THEME.primary}}
								returnKeyType={'done'}
								value={this.state.searchImageQuery}
								renderErrorMessage={false}
								leftIcon={() => this.state.fetchingCustom ? <ActivityIndicator color={THEME.primary} /> : <Icon name={'image-search'} style={{opacity: 0.333}} />}
								onChangeText={value => this.setState({ searchImageQuery: value })}
								onSubmitEditing={event => this.fetchImages(this.state.searchImageQuery, undefined, true)}
							/>

							{this.state.images.length > 0 && <View style={{marginVertical: 10, flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
								{this.state.images.map((image, imageIdx) => (
									<Image key={imageIdx} source={{ uri: image }} style={{ width: '33.333%', height: Dimensions.get('window').width / 3 }} />
								))}
							</View>}

							{this.state.canFetchImages && <Button mode={'outlined'} onPress={() => this.fetchImages(this.state.lastSearchQuery, dataset.columns[0].lang)} disabled={this.state.fetching} loading={this.state.fetching}>
								{I18n.t('btn.fetchMore')}
							</Button>}
						</View>

						<View style={{marginHorizontal: 10, borderRadius: 10, padding: 10, paddingBottom: 7.5, backgroundColor: 'white', marginBottom: 25 }}>

							<View style={{flexDirection: 'row', alignItems: 'center'}}>
								<Icon name={'tag-multiple'} color={THEME.primary} style={{marginRight: 5}} />
								<Text style={{flex: 1}}>{I18n.t('dataset.data.edit.tags')}</Text>
							</View>

							<View style={{marginTop: 5, marginHorizontal: -2.5, flexDirection: 'row', flexWrap: 'wrap'}}>
								{this.state.allTags.map((tag, tagIdx) => (
									<TouchableHighlight style={this.state.tags.indexOf(tag) === -1 ? styles.tag : styles.activeTag} onPress={() => this.toggleTag(tag)}>
										<Text>{tag}</Text>
									</TouchableHighlight>
								))}
							</View>

							<Input
								underlineColorAndroid={'transparent'}
								inputContainerStyle={{marginHorizontal: -10, borderBottomWidth: 0}}
								placeholder={I18n.t('field.tagPlaceholder')}
								inputStyle={{color:THEME.primary}}
								returnKeyType={'done'}
								value={this.state.addTagInput}
								renderErrorMessage={false}
								leftIcon={() => <Icon name={'plus'} />}
								ref={ref => { this.refTagInput = ref }}
								onChangeText={value => this.setState({ addTagInput: value })}
								onSubmitEditing={event => {
									this.pushTag(event.nativeEvent.text);
									setTimeout(() => this.refTagInput.focus(), 250);
								}}
							/>
						</View>
					</ScrollView>

					<View style={{flex: 0, marginHorizontal: 10, marginBottom: 10}}>
						<Divider style={{marginBottom: 10}} />
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<IconButton icon={'chevron-left'} type={'clear'} onPress={() => this.previous()} delayPressIn={0} disabled={dataset.rows.length <= 1} style={{marginVertical: -5, marginLeft: -0}} />
							<View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
								<Button style={{flex: 1}} mode="contained" loading={this.state.saving} onPress={() => this.save(row.id ? false : true)} disabled={!row.isValid() || !this.hasDifferences() || this.state.saving}>
									{I18n.t(row.id ? 'btn.save' : 'btn.add')}
								</Button>
							</View>
							<IconButton icon={'chevron-right'} type={'clear'} onPress={() => this.next()} delayPressIn={0} disabled={dataset.rows.length <= 1} style={{marginVertical: -5, marginRight: -0}} />
						</View>
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
	tag: {
		paddingVertical: 5,
		paddingHorizontal: 10,
		margin: 2.5,
		backgroundColor: '#eee',
		borderRadius: 5,
	},
	activeTag: {
		paddingVertical: 5,
		paddingHorizontal: 10,
		margin: 2.5,
		backgroundColor: THEME.primary,
		color: 'white',
		borderRadius: 5,
	}
});
