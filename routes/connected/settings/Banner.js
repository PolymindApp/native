import React from 'react';
import logo from "../../../assets/images/polymind-dark.png";
import { Link } from '../../../shared';
import { styles } from "../../../styles";
import { Image } from "react-native";
import { Banner } from "react-native-paper";

export default function SettingsBanner(props) {
	return <Banner
		visible={true}
		style={styles.min}
		actions={[]}
		icon={({size}) => (
			<Image source={logo} style={[styles.min, {
				width: 64,
				height: 74,
				borderRadius: 64,
			}]} />
		)}
		{...props}
	>
		Polymind is an open-source application licensed under BSD-3.
		If you wish to contribute, report bugs or propose
		new features, <Link href={'http://google.com'}>visit our Github</Link> page.
	</Banner>
}
