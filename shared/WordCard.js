import * as React from 'react';
import { View, Text } from 'react-native';
import { List, Checkbox, Card } from 'react-native-paper';
import { theme } from '../theme';
import { styles } from '../styles';

const WordCard = props => {

	const { selectable, selected, word, style, ...rest } = props;

	const left = props => selectable === true ? <View style={{marginTop: 9}}>
		<Checkbox
			status={selected ? 'checked' : 'unchecked'}
			color={theme.colors.primary}
		/>
	</View> : null;

	return (
		<Card style={style}>
			<List.Item
				title={word.front}
				description={word.back}
				left={left}
				right={() => <View style={{opacity: 0.33}}>
					<Text style={styles.small}>{word.frontLang.toUpperCase() + ' / ' + word.backLang.toUpperCase()}</Text>
				</View>}
				{...rest}
			/>
		</Card>
	);
}

export default WordCard;
