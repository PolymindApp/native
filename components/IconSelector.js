import React from 'react';
import {Dimensions, Platform, View} from "react-native";
import {Text, Icon, ListItem, SearchBar} from "react-native-elements";
import { IconButton } from 'react-native-paper';
import { THEME } from '@polymind/sdk-js';
import ICONS from '../assets/icons/icons.json';
import I18n from "../locales/i18n";
import {ScrollView} from "react-native-gesture-handler";
import RBSheet from "react-native-raw-bottom-sheet";

export default class IconSelector extends React.Component {

	state = {
		focused: false,
		search: '',
	}

	formattedIconList() {

		const list = [];
		let i = 0;
		for(let icon in ICONS) {
			if (i >= 50) {
				break;
			}
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
							cancelButtonProps={{ color: THEME.primary, buttonStyle: { marginTop: -7 } }}
							onChangeText={search => this.setState({ search })}
							value={this.state.search}
							containerStyle={{marginHorizontal: -10}}
							platform={Platform.OS === 'ios' ? 'ios' : 'android'}
						/>
						<ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'handled'}>
							<View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
								{list.map((icon, iconIdx) => (
									<IconButton
										key={iconIdx}
										icon={icon}
										size={32}
										color={THEME.primary}
										containerStyle={{flex: 0.2}}
										delayPressIn={0}
										onPress={() => this.select(icon)}
									/>
								))}
							</View>
						</ScrollView>
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
