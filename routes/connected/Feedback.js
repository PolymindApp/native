import React from 'react';
import I18n from "../../locales/i18n";
import FooterAction from "../../shared/FooterAction";
import { Title, Paragraph, TextInput, HelperText, Divider, Button } from "react-native-paper";
import { ScrollView, View } from "react-native";
import { styles } from "../../styles";

export default function Page({ navigation, route }) {

	const [email, setEmail] = React.useState('');
	const [message, setMessage] = React.useState('');

	const hasErrors = () => {
		return email;
	};

	const canSend = () => {
		return false;
	};

	return (
		<View style={styles.max}>
			<ScrollView style={styles.max} contentContainerStyle={styles.inner}>

				<Title>Have some thoughts?</Title>
				<Paragraph>I will be more than happy to answer your questions and comments. To do so, please complete and send me this form and I will reply as soon as possible.</Paragraph>

				<Divider style={styles.pushVertical} />

				<TextInput
					mode={'outlined'}
					label={I18n.t('field.email')}
					value={email}
					onChangeText={val => setEmail(val)}
				/>
				<HelperText type="error" visible={hasErrors()}>
					Email address is invalid!
				</HelperText>

				<TextInput
					mode={'outlined'}
					multiline={true}
					numberOfLines={8}
					label={I18n.t('field.message')}
					value={message}
					onChangeText={val => setMessage(val)}
				/>
				<HelperText type="error" visible={hasErrors('message')}>
					Email address is invalid!
				</HelperText>
			</ScrollView>

			<FooterAction>
				<View style={styles.inner}>
					<Button icon="send" mode="contained" onPress={() => console.log('Pressed')} disabled={!canSend()}>
						Send Feedback
					</Button>
				</View>
			</FooterAction>
		</View>
	)
}
