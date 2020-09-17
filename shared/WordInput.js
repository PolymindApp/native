import React from "react";
import { TextInput } from "react-native-paper";

export default function WordInput({ title }) {

	const [text, setText] = React.useState(text);

	return (
		<TextInput
			value={text}
			label={title}
			placeholder={'Type here...'}
			right={<TextInput.Icon name="voice" disabled={text.trim().length === 0} />}
			onChangeText={value => setText(value)}
		/>
	);
}
