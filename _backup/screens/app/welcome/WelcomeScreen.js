import React from 'react'
import {View, Dimensions, Text, StyleSheet, Image} from 'react-native';
import { THEME, UserService } from '@polymind/sdk-js';
import { Button } from 'react-native-paper';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import I18n from '../../../locales/i18n';

export default class WelcomeScreen extends React.Component {

	state = {
		activeSlide: 0,
		data: [
			{ title: I18n.t('welcome.noteTitle'), desc: I18n.t('welcome.noteDesc'), ratio: 1.2, image: require('../../../assets/images/welcome-screen-1.png') },
			{ title: I18n.t('welcome.listenTitle'), desc: I18n.t('welcome.listenDesc'), ratio: 0.42, image: require('../../../assets/images/welcome-screen-2.png') },
			{ title: I18n.t('welcome.rememberTitle'), desc: I18n.t('welcome.rememberDesc'), ratio: 1, image: require('../../../assets/images/welcome-screen-3.png') },
		]
	};

	next() {
		this._carousel.snapToNext();
	}

	skip() {
		const { navigation } = this.props;
		navigation.navigate('App');

		global.user.settings.native.welcomeScreen = true;
		UserService.update(global.user.id, { settings: global.user.settings })
			.then(response => console.log(response))
			.catch(err => {
				console.log(err);
			});
	}

	render() {

		const { width } = Dimensions.get('window');

		return (
			<View style={{flex: 1, backgroundColor: THEME.primary}}>
				<Carousel
					ref={(c) => { this._carousel = c; }}
					data={this.state.data}
					renderItem={({item, index}) => (
						<View style={styles.card}>
							<Image style={[styles.cardImage, { width: styles.cardImage.height * item.ratio }]} source={item.image} />
							<Text style={styles.cardTitle}>{item.title}</Text>
							<Text style={styles.cardDesc}>{item.desc}</Text>
						</View>
					)}
					onSnapToItem={(index) => this.setState({ activeSlide: index }) }
					sliderWidth={Dimensions.get('window').width}
					itemWidth={Dimensions.get('window').width - 60}
				/>
				<View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 10}}>
					<Button onPress={() => this.skip()} color={'rgba(255, 255, 255, 0.5)'}>{I18n.t('btn.skip')}</Button>
					<View style={{flex: 1, justifyContent: 'center'}}>
						<Pagination
							dotsLength={this.state.data.length}
							activeDotIndex={this.state.activeSlide}
							dotStyle={styles.dots}
							inactiveDotStyle={styles.inactiveDots}
							inactiveDotOpacity={0.4}
							inactiveDotScale={0.6}
						/>
					</View>
					{this.state.data.length - 1 > this.state.activeSlide
					? <Button onPress={() => this.next()} color={'white'}>{I18n.t('btn.next')}</Button>
					: <Button onPress={() => this.skip()} color={'white'}>{I18n.t('btn.ready')}</Button>}

				</View>
			</View>
		);
	};
}

const styles = StyleSheet.create({
	card: {
		flex: 1,
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 30,
		paddingHorizontal: 45,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		marginVertical: 15,
	},
	cardImage: {
		marginBottom: 45,
		height: Dimensions.get('window').height / 3,
	},
	cardTitle: {
		fontSize: 30,
		color: THEME.primary,
		textAlign: 'center',
	},
	cardDesc: {
		fontSize: 15,
		marginTop: 10,
		textAlign: 'center',
	},
	dots: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginHorizontal: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.92)'
	},
	inactiveDots: {

	}
});
