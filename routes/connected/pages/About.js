import React from 'react';
import danny from '../../../assets/images/danny.jpg';
import FooterAction from '../../../shared/FooterAction';
import { View, ScrollView, Image } from 'react-native';
import { Title, Paragraph, Text, Button } from 'react-native-paper';
import { styles } from '../../../styles';
import { theme } from '../../../theme';

export default function Terms({ navigation, route }) {
	return (
		<View style={styles.max}>
			<ScrollView contentContainerStyle={[styles.inner]}>
				<View style={[styles.horizontal, styles.pushVertical]}>
					<Image source={danny} style={[styles.min, {
						width: 64,
						height: 64,
						borderRadius: 64,
					}]} />
					<View style={[styles.max, {marginLeft: 10}]}>
						<Title style={{color: theme.colors.primary}}>For the sole benefit of helping</Title>
					</View>
				</View>

				<Paragraph style={styles.pushVertical}>
					Polymind is designed as a language memorization companion for people with learning difficulties.
				</Paragraph>

				<Paragraph style={styles.pushVertical}>
					As for me, I am a software developer from Montreal who likes working on projects that benefits the community. My goal with Polymind is to develop something that will help people understand <Text style={styles.underline}>and</Text> memorize foreign languages.
				</Paragraph>

				<Paragraph style={styles.pushVertical}>
					There are so many beautiful people and cultures out there and I wish to everyone the chance to live new experiences thanks to the amazing opportunities that offers the mastery of a new language.
				</Paragraph>

				<Paragraph style={styles.pushVertical}>
					All the best,
				</Paragraph>

				<Paragraph>
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
