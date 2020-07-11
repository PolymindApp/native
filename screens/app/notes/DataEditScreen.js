import React from 'react'
import {Alert, ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PolymindSDK, { TextToSpeechService, File, Locale, FileService, THEME, Helpers, Dataset, DatasetRow, DatasetRowService, DatasetCell, DatasetService, SpellCheckService, TranslateService, GoogleService } from '@polymind/sdk-js';
import I18n from '../../../locales/i18n';
import {Divider, Icon, Input, Text} from "react-native-elements";
import {Button, IconButton} from "react-native-paper";
import ContextualOptions from "../../../components/ContextualOptions";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import {Linking } from "expo";
import * as ImageManipulator from "expo-image-manipulator";
import Offline from "../../../utils/Offline";
import Sound from "../../../utils/Sound";

const $polymind = new PolymindSDK();

let checkServiceTimeout;
let lastCheckServiceFieldContent = '';

export default class DataEditScreen extends React.Component {

	state = {
		fields: [],
		images: [],
		largeImages: [],
		tags: [],
		optionsMenu: false,
		autofocus: true,
		deleting: false,
		saving: false,
		row: new DatasetRow(),
		spellCheckFields: [],
		translationFields: [],
		fetching: false,
		fetchingCustom: false,
		canFetchMoreImages: false,
		imageOffset: 0,
		imageUri: null,
		emptyImageResults: false,
		lastSearchQuery: null,
		searchQueryContext: '',
		searchImageQuery: '',
		cameraOpen: false,
		allTags: [],
		addTagInput: '',
		hasCamera: false,
		mustUploadLocalUri: false,
		mustUploadRemoteUri: false,
		selectedImageIdx: null,
	};

	refInputs = [];
	refTagInput = React.createRef();
	refCamera = React.createRef();

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

	getTags() {
		const tags = [];
		const { dataset } = this.props.route.params.datasetContext.state;
		dataset.rows.forEach(row => {
			row.tags.forEach(tag => {
				if (tags.indexOf(tag) === -1) {
					tags.push(tag);
				}
			});
		});
		return tags;
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

		const callback = fileData => {

			this.fixHumanInput();

			const row = this.state.row;
			dataset.columns.forEach((column, columnIdx) => {
				row.cells[columnIdx].text = this.state.fields[columnIdx];
			});

			const clone = new Dataset(Helpers.deepClone(dataset));
			row.tags = this.state.tags;

			if (fileData) {
				row.image = fileData.id;
			} else if (this.state.imageUri === null) {
				row.image = null;
			}

			if (row.id) {
				clone.rows[rowIdx] = row;
			} else {
				clone.rows.push(row);
			}

			let imageUri = this.state.imageUri;
			const transactions = clone.getTransactions(originalDataset);
			this.setState({ saving: true });
			return DatasetService.save(transactions).then(response => {

				dataset.applyTransactionResponse(response);

				if (fileData) {
					dataset.rows[rowIdx].image = fileData;
				}

				datasetContext.updateOriginal(dataset);
				datasetDataContext.setState({dataset});

				// Generate and cache voices..
				const voicePayload = [];
				dataset.columns.forEach((column, columnIdx) => {
					const locale = Locale.abbrToLocale(column.lang);
					if (this.state.fields[columnIdx]) {
						voicePayload.push({
							locale,
							text: this.state.fields[columnIdx],
						});
					}
				});
				DatasetService.fetchVoices(voicePayload).then(voices => {

					if (voices.errors.length > 0) {
						console.error(voices.errors);
					}

					Promise.all(
						voices.success.map(voice => TextToSpeechService.getDataStream(voice.text, voice.locale))
					).then(responses => {
						responses.forEach((data, idx) => {
							const base64 = File.btoa(data);
							Offline.cacheBase64(base64);
						});
					});
				}).catch(err => console.log(err));

				const moreState = {};
				if (addMore) {
					this.props.route.params.rowIdx++;
					this.prepare(true);
				} else {
					this.prepare();

					if (dataset.rows[rowIdx].image?.private_hash) {
						imageUri = $polymind.getThumbnailByPrivateHash(dataset.rows[rowIdx].image.private_hash, 'avatar');
					}
				}
				addMore && this.refInputs[0].focus();
			}).finally(() => this.setState({ saving: false, autofocus: addMore, imageUri }));
		};

		this.setState({ saving: true, autofocus: addMore });

		if (this.state.mustUploadLocalUri) {
			return FileService.uploadLocalUri(this.state.imageUri).then(filesResponse => callback(filesResponse.data)).catch(err => {
				console.log(err);
			});
		} else if (this.state.mustUploadRemoteUri) {
			let uri = this.state.imageUri;
			if (this.state.selectedImageIdx !== null) {
				uri = this.state.largeImages[this.state.selectedImageIdx];
			}
			return FileService.uploadFromUrl(uri).then(filesResponse => callback(filesResponse.data)).catch(err => {

				Alert.alert(I18n.t('alert.uploadFromUrlErrorTitle'), I18n.t('alert.uploadFromUrlErrorDesc'), [
					{ text: I18n.t('btn.tryAgain'), onPress: () => {
						this.save(addMore);
					} },
					{ text: I18n.t('btn.cancel'), style: "cancel" }
				], { cancelable: false });
			});
		} else {
			return callback();
		}
	}

	prepare(newRow = false) {
		const state = {};
		const { dataset } = this.props.route.params.datasetContext.state;
		const fields = [];
		const refInputs = [];
		let row = this.getRow(newRow);
		dataset.columns.forEach((column, columnIdx) => {
			fields.push(row.cells[columnIdx].text || '');
			refInputs.push(React.createRef());
		});

		state.allTags = this.getTags();
		state.tags = [...row.tags];
		state.mustUploadLocalUri = false;
		state.mustUploadRemoteUri = false;
		state.selectedImageIdx = null;
		state.images = [];
		state.imageUri = null;
		state.canFetchMoreImages = false;
		state.emptyImageResults = false;
		state.lastSearchQuery = '';
		state.searchQueryContext = '';
		state.searchImageQuery = '';
		state.spellCheckFields = [];
		state.translationFields = [];

		if (dataset.include_image) {
			if (row.image?.private_hash) {
				state.imageUri = $polymind.getThumbnailByPrivateHash(row.image.private_hash, 'avatar');
			} else if (fields[0].length > 3) {
				this.fetchImages(fields[0], dataset.columns[0].lang);
			}
		}

		this.setState({ ...state, fields, row, autofocus: row.id === null });
	}

	removeImage(force = false) {
		if (!force) {
			Alert.alert(
				I18n.t('dataset.data.edit.removeImageTitle'),
				I18n.t('dataset.data.edit.removeImageDesc'),
				[
					{ text: I18n.t('btn.cancel') },
					{ text: I18n.t('btn.delete'), onPress: () => this.removeImage(true), style: 'destructive' },
				],
				{ cancelable: false }
			);

		} else {
			const row = this.getRow();
			this.setState({ imageUri: null });
		}
	}

	async componentDidMount() {
		const { navigation } = this.props;
		this._navigationFocus = navigation.addListener('focus', () => {
			this.prepare();
		});

		const callback = (props) => {
			setTimeout(() => {
				this.setState({ ...props, autofocus: false });
			});
		};

		callback ({ hasCamera: Platform.OS === 'web' ? await Camera.isAvailableAsync() : true });
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

		if (JSON.stringify(row.tags.sort()) !== JSON.stringify(this.state.tags.sort())) {
			return true;
		}

		if (this.state.mustUploadRemoteUri || this.state.mustUploadLocalUri || (row.image !== null && this.state.imageUri === null)) {
			return true;
		}

		return false;
	}

	checkServices(fieldIdx, delay = 1000) {
		clearTimeout(checkServiceTimeout);
		checkServiceTimeout = setTimeout(() => {
			const { spellCheckFields } = this.state;
			const { dataset } = this.props.route.params.datasetContext.state;
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

					if (!this.state.imageUri) {
						this.fetchImages(this.state.fields[fieldIdx], dataset.columns[fieldIdx].lang);
					}
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
			return SpellCheckService.check(text, Locale.abbrToLocale(locale)).then(tokens => {

				if (!tokens) {
					resolve(false);
					return;
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
			const promises = [];

			let toLocales = []
			for (let i = 0; i < this.state.fields.length; i++) {
				if (i !== fieldIdx) {
					promises.push(GoogleService.translate(text, fromLocale, dataset.columns[i].lang));
				} else {
					promises.push(null);
				}
			}

			return Promise.all(promises).then(responses => {
				responses.forEach((response, responseIdx) => {
					if (response === null) {
						return;
					}
					const proposition = response[0].translatedText
					if (proposition.toLowerCase() !== this.state.fields[responseIdx].toLowerCase()) {
						translationFields[responseIdx] = proposition;
					}
				});
				return resolve(translationFields);
			});
		});
	}

	fetchImages(query, locale, customQuery = false) {

		// Query only until first separating character..
		query = query.split(',')[0];
		query = query.split('/')[0];
		query = query.split(':')[0];
		query = query.split('(')[0];
		query = query.split(';')[0];
		query = query.split('\\')[0];

		if (query.length > 5) {
			query = query.replace(/(\b(\w{1,3})\b(\s|$))/g,'');
		}

		this.setState({ fetching: !customQuery, fetchingCustom: customQuery, emptyImageResults: false });
		return GoogleService.fetchImages(query, locale, {
			start: this.state.imageOffset + 1,
			num: 9,
		})
			.then(response => {

				let images = this.state.lastSearchQuery === query ? this.state.images : [];
				let largeImages = this.state.lastSearchQuery === query ? this.state.largeImages : [];

				if (images.length === 0) {
					this.state.selectedImageIdx = null;
				}

				const totalResults = parseInt(response.searchInformation.totalResults);
				if (totalResults === 0) {
					return this.setState({ emptyImageResults: true, images });
				}

				const largeItems = response.items.map(item => item.link);
				largeImages = largeImages.concat(largeItems);

				const items = response.items.map(item => item.image.thumbnailLink);
				images = images.concat(items);

				this.setState({ largeImages, selectedImageIdx: this.state.selectedImageIdx, images, lastSearchQuery: query, imageOffset: this.state.imageOffset + 9, canFetchMoreImages: images.length < 27 && totalResults >= 9 });
			})
			.catch(err => console.log(err))
			.finally(() => this.setState({ fetching: false, fetchingCustom: false }));
	}

	toggleImageSelection(idx) {
		this.setState({
			selectedImageIdx: this.state.selectedImageIdx === idx ? null : idx,
			mustUploadRemoteUri: this.state.selectedImageIdx === idx ? null : true,
		});
	}

	async uploadFromGallery() {
		if (Constants.platform.ios) {
			const { status } = await Permissions.askAsync(Permissions.CAMERA);
			if (status !== 'granted') {
				console.log('Sorry, we need camera roll permissions to make this work!');
				return;
			}
		}

		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.5,
		});

		if (!result.cancelled) {
			this.state.imageUri = result.uri;
			this.state.mustUploadLocalUri = true;
			this.setState(this.state);
		}
	}

	async openCamera() {

		const { status } = await Permissions.askAsync(Permissions.CAMERA);
		if (status !== 'granted') {
			Alert.alert(
				I18n.t('permission.manualCameraActivationTitle'),
				I18n.t('permission.manualCameraActivationDesc'),
				[
					{ text: I18n.t('btn.cancel') },
					{ text: I18n.t('btn.grant'), onPress: () => Linking.openURL("app-settings:") },
				],
				{ cancelable: false }
			);
		}
		this.setState({cameraOpen: status === 'granted'});
	}

	takePicture() {
		if (this.refCamera) {
			this.refCamera.takePictureAsync({
				onPictureSaved: async photo => {

					let uri = photo.uri;
					const ratio = photo.width / photo.height;
					if (photo.width > 640) {
						const manipulation = await ImageManipulator.manipulateAsync(
							photo.uri,
							[{ resize: { width: 640, height: 640 / ratio } }],
							{ compress: 0.5, format: 'jpeg' }
						);
						uri = manipulation.uri;
					}


					this.state.cameraOpen = false;
					this.state.imageUri = uri;
					this.state.mustUploadLocalUri = true;
					this.setState(this.state);
				}
			});
		}
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
		// fields[fieldIdx] = fields[fieldIdx].replace(/[\(\)]/, "");
		this.setState({ fields, spellCheckFields, translationFields });

		if (fetchServices) {
			this.checkServices(fieldIdx, fetchServicesDelay);
		}
	}

	fixHumanInput() {

		// Remove double spaces and capitalize first character
		this.state.fields.forEach((field, fieldIdx) => {
			field = field.substring(0, 1).toUpperCase() + field.substring(1);
			field = field.replace(/\s{2,}/g, ' ');
			this.state.fields[fieldIdx] = field.trim();
		});

		this.setState({ fields: this.state.fields });
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

		if (this.state.cameraOpen) {
			return (
				<Camera style={{ flex: 1, alignItems: 'center' }} ref={ref => this.refCamera = ref} type={Camera.Constants.Type.back}>
					<View style={{flex: 1}}></View>
					<View style={{flex: 0, marginHorizontal: 10}}>
						<IconButton icon={'circle-slice-8'} color={THEME.primary} size={64} onPress={() => this.takePicture()} delayPressIn={0} />
					</View>
				</Camera>
			);
		}

		return (
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{flex: 1}}
			>
				<View style={{flex: 1}}>
					<ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>

						{/*FIELDS*/}
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
												// this.save(true);
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

						{/*IMAGES*/}
						{dataset.include_image && <View style={{marginHorizontal: 10, borderRadius: 10, padding: 10, backgroundColor: 'white', marginBottom: 10 }}>
							<View style={{flexDirection: 'row', alignItems: 'center'}}>
								<Icon name={'image'} color={THEME.primary} style={{marginRight: 5}} />
								<Text style={{flex: 1}}>{I18n.t('dataset.data.edit.image')}</Text>
							</View>

							{this.state.imageUri &&
								<View style={{ marginTop: 5 }}>
									<TouchableOpacity style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 1, top: 10, right: 10}} onPress={() => this.removeImage()}>
										<Icon name={'close'} color={THEME.error} style={{width: 23, height: 23}} size={24} backgroundColor={'white'} borderRadius={100} />
									</TouchableOpacity>

									<Image source={{ uri: this.state.imageUri }} style={{width: '100%', height: (Dimensions.get('window').width - 40)}} />
								</View>}

							<Input
								clearButtonMode={'always'}
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

							{this.state.emptyImageResults && <View style={{marginTop: 10, padding: 10, backgroundColor: THEME.warning, borderRadius: 5, flexDirection: 'row', alignItems: 'center'}}>
								<Icon name={'alert'} style={{marginRight: 10}} />
								<Text style={{flex: 1, flexWrap: 'wrap'}}>{I18n.t('dataset.data.edit.noImageFound')}</Text>
							</View>}

							{this.state.images.length > 0 && <Text style={{marginTop: 5, opacity: 0.5}}>
								{I18n.t('dataset.data.edit.imageDesc')}
							</Text>}
							{this.state.images.length > 0 && <View style={{marginTop: 10, flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
								{this.state.images.map((image, imageIdx) => (
									<TouchableOpacity key={imageIdx} style={{ width: '33.333%', height: Dimensions.get('window').width / 3 }} onPress={() => this.toggleImageSelection(imageIdx)}>
										{this.state.selectedImageIdx === imageIdx && (<View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 1, top: 5, right: 5}}>
											<Icon name={'check-circle'} color={THEME.primary} style={{width: 23, height: 23}} size={24} backgroundColor={'white'} borderRadius={100} />
										</View>)}

										<Image source={{ uri: image }} style={{ width: '100%', height: Dimensions.get('window').width / 3 }} />
									</TouchableOpacity>
								))}
							</View>}

							{this.state.canFetchMoreImages && <Button mode={'text'} style={{marginTop: 10}} onPress={() => this.fetchImages(this.state.lastSearchQuery, dataset.columns[0].lang)} disabled={this.state.fetching} loading={this.state.fetching}>
								{I18n.t('btn.fetchMore')}
							</Button>}

							<Button mode={'outlined'} icon={'cloud-upload'} style={{marginTop: 10}} onPress={() => this.uploadFromGallery()} disabled={this.state.uploading} loading={this.state.uploading}>
								{I18n.t('btn.upload')}
							</Button>

							{this.state.hasCamera && <Button mode={'outlined'} icon={'camera'} style={{marginTop: 5}} onPress={() => this.openCamera()} disabled={this.state.uploading} loading={this.state.uploading}>
								{I18n.t('btn.takePhoto')}
							</Button>}
						</View>}

						{/*TAGS*/}
						<View style={{marginHorizontal: 10, borderRadius: 10, padding: 10, paddingBottom: 7.5, backgroundColor: 'white', marginBottom: 25 }}>

							<View style={{flexDirection: 'row', alignItems: 'center'}}>
								<Icon name={'tag-multiple'} color={THEME.primary} style={{marginRight: 5}} />
								<Text style={{flex: 1}}>{I18n.t('dataset.data.edit.tags')}</Text>
							</View>

							<View style={{marginTop: 5, marginHorizontal: -2.5, flexDirection: 'row', flexWrap: 'wrap'}}>
								{this.state.allTags.map((tag, tagIdx) => (
									<TouchableOpacity key={tagIdx} style={this.state.tags.indexOf(tag) === -1 ? styles.tag : styles.activeTag} onPress={() => this.toggleTag(tag)}>
										<Text style={(this.state.tags.indexOf(tag) === -1 ? styles.tagText : styles.activeTagText)}>{tag}</Text>
									</TouchableOpacity>
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
								onSubmitEditing={event => this.pushTag(this.state.addTagInput)}
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
		borderRadius: 5,
	},
	tagText: {
		color: 'black',
	},
	activeTagText: {
		color: 'white'
	},
});
