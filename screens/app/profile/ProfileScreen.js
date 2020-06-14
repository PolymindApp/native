import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Icon, ListItem } from 'react-native-elements';
import PolymindSDK, { User, THEME } from "@polymind/sdk-js";
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import I18n from '../../../locales/i18n';

const $polymind = new PolymindSDK();
const sections = [
	// { title: I18n.t('profile.activities'), icon: 'timeline-text', name: 'ProfileActivities' },
	{ title: I18n.t('profile.informations'), icon: 'card-bulleted-outline', name: 'ProfileInformations' },
	{ title: I18n.t('profile.parameters'), icon: 'settings-outline', name: 'ProfileSettings' },
];

const preview = require('../../../assets/images/avatar.png');

export default class ProfileScreen extends React.Component {

	state = {
		loading: true,
		thumbnail: null,
		me: new User(),
	};

	load() {
		this.setState({ loading: true });
		$polymind.me().then(me => {
			let thumbnail = preview;
			if (me.avatar && me.avatar.private_hash) {
				thumbnail = $polymind.getThumbnailByPrivateHash(me.avatar.private_hash, 'avatar')
			}
			this.setState({ me, thumbnail, loading: false });
		});
	}

	getCompleteName() {
		return (this.state.me.first_name + ' ' + this.state.me.last_name).trim() || this.state.me.email || '';
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
			quality: 1,
		});

		console.log(result);

		if (!result.cancelled) {
			this.setState({ thumbnail: result.uri });
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
					leftAvatar={{
						title: this.getCompleteName().substring(0, 1),
						source: this.state.thumbnail ? { uri: this.state.thumbnail } : null,
						showAccessory: true,
						size: 'large',
					}}
					delayPressIn={0}
					title={ this.getCompleteName() }
					subtitle={ I18n.t('profile.role.' + this.state.me.role.name.toLowerCase()) }
					containerStyle={{backgroundColor: 'transparent'}}
					onPress={() => this.setAvatar()}
				/>

				<View style={{margin: 10, padding: 10, backgroundColor: 'white', borderRadius: 10, elevation: 20}}>
					{sections.map((section, sectionIdx) => (
						<ListItem key={sectionIdx} title={section.title} leftIcon={<Icon name={section.icon} />} chevron delayPressIn={0} onPress={() => navigation.push(section.name, { user: this.state.me })} topDivider={sectionIdx !== 0} />
					))}
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
