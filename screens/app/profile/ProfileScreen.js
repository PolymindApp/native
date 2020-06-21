import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Icon, ListItem, Text } from 'react-native-elements';
import PolymindSDK, { User, THEME, FileService, UserService } from "@polymind/sdk-js";
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import I18n from '../../../locales/i18n';
import {List} from "react-native-paper";

const $polymind = new PolymindSDK();
const sections = [
	{ title: I18n.t('profile.informations'), icon: 'card-bulleted-outline', name: 'ProfileInformations' },
	// { title: I18n.t('profile.parameters'), icon: 'settings-outline', name: 'ProfileSettings' },
];
const pages = [
	{ title: I18n.t('legal.terms'), name: 'ProfilePage', props: { slug: 'terms' } },
	{ title: I18n.t('legal.privacy'), name: 'ProfilePage', props: { slug: 'privacy' } },
];

const preview = require('../../../assets/images/avatar.png');

export default class ProfileScreen extends React.Component {

	state = {
		uploading: false,
		loading: true,
		thumbnail: null,
		me: new User(),
	};

	load() {

		this.setState({ loading: true });
		$polymind.me().then(me => {
			let thumbnail = preview;
			if (me.avatar && me.avatar.private_hash) {
				thumbnail = { uri : $polymind.getThumbnailByPrivateHash(me.avatar.private_hash, 'avatar') }
			}
			this.setState({ me, thumbnail, loading: false });
		});
	}

	getCompleteName() {
		return this.state.me.screen_name || (this.state.me.first_name + ' ' + this.state.me.last_name).trim() || this.state.me.email || '';
	}

	async setAvatar() {
		if (Constants.platform.ios) {
			const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
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
			this.setState({ uploading: true });
			FileService.uploadLocalUri(result.uri).then(filesResponse => {
				UserService.update(this.state.me.id, {
					avatar: filesResponse.data.id
				}).finally(response => this.setState({ thumbnail: result.uri, uploading: false, }));
			});
		}
	}

	componentDidMount() {
		this.load();
	}

	render() {

		const { navigation } = this.props;

		if (this.state.loading) {
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large" color={THEME.primary} />
				</View>
			);
		}

		return (
			<ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>

				<ListItem
					leftAvatar={this.state.uploading ? <ActivityIndicator size={'large'} color={THEME.primary} /> : {
						title: this.getCompleteName().substring(0, 1),
						source: this.state.thumbnail,
						showAccessory: true,
						size: 'large',
					}}
					delayPressIn={0}
					title={ this.getCompleteName() }
					subtitle={ I18n.t('profile.role.' + this.state.me.role.name.toLowerCase()) }
					containerStyle={{backgroundColor: 'white'}}
					onPress={() => this.setAvatar()}
				/>

				<View style={{marginTop: 15}}>
					<List.Subheader>{I18n.t('profile.myInfoSection')}</List.Subheader>
					<View style={{marginHorizontal: 10, padding: 10, backgroundColor: 'white', borderRadius: 10}}>
						{sections.map((section, sectionIdx) => (
							<ListItem key={sectionIdx} title={section.title} leftIcon={<Icon name={section.icon} />} chevron delayPressIn={0} onPress={() => navigation.push(section.name, { user: this.state.me, profileContext: this })} topDivider={sectionIdx !== 0} />
						))}
					</View>
				</View>

				<View style={{marginTop: 15}}>
					<List.Subheader>{I18n.t('profile.legalSection')}</List.Subheader>
					<View style={{marginHorizontal: 10, padding: 10, backgroundColor: 'white', borderRadius: 10}}>
						{pages.map((page, pageIdx) => (
							<ListItem key={pageIdx} title={page.title} chevron delayPressIn={0} onPress={() => navigation.push(page.name, page.props)} topDivider={pageIdx !== 0} />
						))}
					</View>
				</View>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
