import React from 'react';
import {Dimensions, Platform, View, FlatList} from "react-native";
import {Text, Icon, ListItem, SearchBar} from "react-native-elements";
import { IconButton } from 'react-native-paper';
import { THEME } from '@polymind/sdk-js';
import ICONS from '../assets/icons/icons.json';
import I18n from "../locales/i18n";
import RBSheet from "react-native-raw-bottom-sheet";

export default class IconSelector extends React.Component {

	state = {
		focused: false,
		search: '',
	}

	// build(items) {
	//
	// 	const dig = (item, deepnest = 0) => {
	//
	// 	};
	//
	// 	return {
	// 		structure,
	// 		filter(query) {
	// 			let path;
	// 			for (let i = 0; i < query.length; i++) {
	// 				const char = query[i];
	// 				if (path) {
	//
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	// componentDidMount() {
	// 	this.dictionary = this.build(ICONS);
	// }

	formattedIconList() {

		if (this.state.search.trim().length === 0) {
			return ICONS;
		}

		// const results = binarySearch(ICONS, this.state.search.trim().toLowerCase());
		// console.log(results);
		// return results;

		const list = [];
		let i = 0;

		for(let key in ICONS) {
			const icon = ICONS[key];
			if (icon.trim().toLowerCase().indexOf(this.state.search.trim().toLowerCase()) !== -1) {
				list.push(icon);
				i++;
			}
		}
		return list;
	}

	open() {
		this.RBSheet.open();
	}

	close() {
		this.RBSheet.close();
	}

	select(icon) {
		this.props.onChange('mdi-' + icon);
		this.close();
	}

	render() {
		const list = this.formattedIconList();

		return (
			<View>
				<RBSheet
					ref={ref => this.RBSheet = ref}
					height={Dimensions.get('window').height / 1.2}
					animationType={'fade'}
					closeOnDragDown={true}
					customStyles={{
						container: {
							borderTopLeftRadius: 15,
							borderTopRightRadius: 15,
						}
					}}
				>
					<View style={{padding: 10, flex: 1, justifyContent: 'flex-end'}}>
						<Text style={{marginBottom: 10}} h4>
							{I18n.t('iconSelector.chooseIcon')}
						</Text>
						<SearchBar
							placeholder={I18n.t('input.filter')}
							cancelButtonTitle={I18n.t('btn.cancel')}
							cancelButtonProps={{ color: THEME.primary, buttonStyle: { marginTop: -3 } }}
							value={this.state.search}
							onChangeText={search => this.setState({ search })}
							containerStyle={{marginHorizontal: -3}}
							platform={Platform.OS === 'ios' ? 'ios' : 'android'}
						/>
						<FlatList
							data={list}
							numColumns={5}
							initialNumToRender={50}
							renderItem={ item => <IconButton
								icon={item.item}
								size={32}
								color={THEME.primary}
								delayPressIn={0}
								onPress={() => {
									console.log(item);
									this.select(item.item)
								}}
							/>}
							keyExtractor={item => Math.random().toString(12).substring(0)}
						/>
					</View>
				</RBSheet>
				<ListItem
					{...this.props}
					leftIcon={() => (
						<Icon
							name={this.props.defaultValue.substring(4) || 'checkbox-blank-circle-outline'}
							color={THEME.primary}
							containerStyle={{width: 32}}
						/>
					)}
					delayPressIn={0}
					onPress={() => this.open()}
				/>
			</View>
		);
	}
}
