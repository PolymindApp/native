import React from 'react';
import { ScrollView } from 'react-native';
import { Title, Paragraph } from 'react-native-paper';
import { styles } from '../../../styles';

export default function Terms() {
	return (
		<ScrollView contentContainerStyle={[styles.inner]}>
			<Title>Learn, strategically.</Title>
			<Paragraph>Polymind is a strategic learning design platform. Supply your databases and assign them to the components provided by the platform in order to plan and energize your learning over a defined period.</Paragraph>
			<Paragraph>The components are experiences, databases of objectives and strategies of mechanisms which reinforce the assimilation of objective / experience combinations.</Paragraph>
			<Paragraph>At the end of each session, reports are produced to help you visualize the most frequent difficulties based on the labeling of your data. This categorization by label adds dynamism in addition to allowing the Polymind ecosystem to offer you solutions through a system of prohibited cross-validation. You can use this data collected later to isolate or become aware of specific difficulties.</Paragraph>
			<Paragraph>In the Polymind universe, there is no path or directive, you are the author of the intellectual journey that you wish to undertake.</Paragraph>
		</ScrollView>
	)
}
