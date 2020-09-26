import React from 'react';
import I18n from "../../locales/i18n";
import { FooterAction, Rules, Services } from "../../shared";
import { Title, Paragraph, TextInput, HelperText, Divider, Button, List, Checkbox, Card } from "react-native-paper";
import { ScrollView, View } from "react-native";
import { styles } from "../../styles";
import { theme } from "../../theme";

export default function Page({ navigation, route }) {

	const [state, setState] = React.useState({
		dirty: false,
		sending: false,
		success: false,
	});
	const [formState, setFormState] = React.useState({
		email: '',
		message: '',
		includeCopy: false,
	});

	const hasError = (type) => {
		switch (type) {
			case 'email':
				return !Rules.email(formState.email);
			case 'message':
				return !Rules.min(5, formState.message);
		}
	};

	const hasErrors = () => {
		const fields = ['email', 'message']
		for (let i = 0; i < fields.length; i++) {
			const field = fields[i];
			if (hasError(field)) {
				return true;
			}
		}
		return false;
	};

	const canSend = () => {
		return !state.dirty || (
			!hasErrors('email')
			&& !hasErrors('message')
		);
	};

	const send = () => {

		if (!canSend()) {
			return;
		}

		setState(prev => ({ dirty: true }));

		if (hasErrors()) {
			return;
		}

		setState(prev => ({ sending: true}));
		Services.sendEmail(
			'feedback',
			formState.email,
			'Feedback',
			formState.message,
			formState.includeCopy
		)
			.then(response => {
				setState(prev => ({ success: true }))
			})
			.catch(error => console.log(error))
			.finally(() => setState(prev => ({ sending: false })));
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
					value={formState.email}
					disabled={state.sending}
					onChangeText={val => setFormState(prev => ({ ...prev, email: val }))}
				/>
				<HelperText type="error" visible={state.dirty && hasError('email')}>
					Email address is invalid!
				</HelperText>

				<TextInput
					mode={'outlined'}
					multiline={true}
					numberOfLines={8}
					label={I18n.t('field.message')}
					value={formState.message}
					disabled={state.sending}
					onChangeText={val => setFormState(prev => ({ ...prev, message: val }))}
				/>
				<HelperText type="error" visible={state.dirty && hasError('message')}>
					Your message must be longer.
				</HelperText>

				<Card>
					<List.Item
						title={'Send me a copy'}
						left={() => <Checkbox.Android
							status={formState.includeCopy ? 'checked' : 'unchecked'}
							color={theme.colors.primary}
						/>}
						disabled={state.sending}
						onPress={() => setFormState(prev => ({ ...prev, includeCopy: !formState.includeCopy }))}
					/>
				</Card>

			</ScrollView>

			<FooterAction>
				<View style={styles.inner}>
					<Button icon="send" mode="contained" loading={state.sending} onPress={() => send()} disabled={!canSend() || state.sending}>
						Send Feedback
					</Button>
				</View>
			</FooterAction>
		</View>
	)
}
