import React from 'react';
import logo from '../../../assets/images/polymind-dark.png';
import { FooterAction } from '../../../shared';
import { View, ScrollView, Image } from 'react-native';
import { Title, Paragraph, Text, Button } from 'react-native-paper';
import { styles, large, small } from '../../../styles';
import { theme } from '../../../theme';

export default function Terms({ navigation, route }) {
	return (
		<View style={styles.max}>
			<ScrollView contentContainerStyle={[styles.inner]}>
				<View style={[styles.horizontal, styles.pushVertical]}>
					<Image source={logo} style={[styles.min, {
						width: 64,
						height: 74,
					}]} />
					<View style={[styles.max, {marginLeft: large}]}>
						<Title style={{ color: theme.colors.primary }}>
							For the sole benefit of helping people discover languages
						</Title>
					</View>
				</View>

				<Paragraph style={styles.pushVertical}>
					Polymind is designed as a language learning and memorization companion for self-taught people.
				</Paragraph>

				<Paragraph style={styles.pushVertical}>
					As for me, I am a software developer from Montreal who likes working on projects that benefits the community. My goal with Polymind is to develop something that will help people discover, understand <Text style={styles.underline}>and</Text> memorize foreign words.
				</Paragraph>

				<Paragraph style={styles.pushVertical}>
					There are so many beautiful people and cultures out there and I wish to everyone the chance to live new experiences thanks to the amazing opportunities that offers the mastery of a new language.
				</Paragraph>

				<Paragraph style={styles.pushVertical}>
					All the best,
				</Paragraph>

				<Paragraph style={{marginTop: -small}}>
					Danny
				</Paragraph>

			</ScrollView>

			<FooterAction>
				<View style={styles.inner}>
					<Button mode="contained" onPress={() => {
						navigation.navigate('Feedback');
					}}>
						Get in touch
					</Button>
				</View>
			</FooterAction>
		</View>
	)
}
