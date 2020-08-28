import React from "react";
import {View, TouchableOpacity, StyleSheet, Image} from "react-native";
// import { SliderBox } from "react-native-image-slider-box";
import { THEME } from '@polymind/sdk-js';

export default class Card extends React.Component {

	render() {
		const { style, images, children, ...rest } = this.props;

		return (
			<TouchableOpacity style={styles.container} {...rest}>
				{images.items.length > 0 && <Image
					style={{
						width: images.width,
						height: images.height,
					}}
					source={images.items[0]}
				/>}
				{/*{images.items.length > 0 && <SliderBox*/}
				{/*	images={images.items}*/}
				{/*	resizeMode={'cover'}*/}
				{/*	imageLoadingColor={THEME.primary}*/}
				{/*	dotStyle={{ width: 0, height: 0 }}*/}
				{/*	pointerEvents={'none'}*/}
				{/*	style={{*/}
				{/*		borderTopLeftRadius: 5,*/}
				{/*		borderTopRightRadius: 5,*/}
				{/*		height: images.height,*/}
				{/*		width: images.width,*/}
				{/*		backgroundColor: '#eee',*/}
				{/*	}}*/}
				{/*	parentWidth={images.width}*/}
				{/*	sliderBoxHeight={images.height}*/}
				{/*	autoplay*/}
				{/*	circleLoop*/}
				{/*/>}*/}
				<View style={style}>
					{children}
				</View>
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		borderRadius: 5,
		backgroundColor: 'white',
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 1.84,
		elevation: 4,
	}
});
