import React from 'react';
import { ScrollView } from 'react-native';
import { Title, Paragraph } from 'react-native-paper';
import { Link } from '../../../shared';
import { styles } from '../../../styles';

export default function Terms({navigation, route}) {
	return (
		<ScrollView contentContainerStyle={[styles.inner]}>
			<Paragraph>Last updated: 2019-09-08</Paragraph>
			<Paragraph>Polymind ("us", "we", or "our") operates https://www.polymind.app (the "App"). This page informs you of our policies regarding the collection, use and disclosure of Personal Information we receive from users of the App.</Paragraph>
			<Paragraph>We use your Personal Information only for providing and improving the App. By using the App, you agree to the collection and use of information in accordance with this policy.</Paragraph>
			<Title>Information Collection And Use</Title>
			<Paragraph>While using our App, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to your name ("Personal Information").</Paragraph>
			<Title>Log Data</Title>
			<Paragraph>Like many site operators, we collect information that your browser sends whenever you visit our App ("Log Data").</Paragraph>
			<Paragraph>This Log Data may include information such as your computer's Internet Protocol ("IP") address, browser type, browser version, the pages of our App that you visit, the time and date of your visit, the time spent on those pages and other statistics. In addition, we may use third party services such as Google Analytics that collect, monitor and analyze this …</Paragraph>
			<Title>Communications</Title>
			<Paragraph>We may use your Personal Information to contact you with newsletters, marketing or promotional materials and other information that ...</Paragraph>
			<Title>Cookies</Title>
			<Paragraph>Cookies are files with small amount of data, which may include an anonymous unique identifier. Cookies are sent to your browser from a web site and stored on your computer's hard drive.</Paragraph>
			<Paragraph>Like many sites, we use "cookies" to collect information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our App.</Paragraph>
			<Title>Security</Title>
			<Paragraph>The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.</Paragraph>
			<Title>Changes To This Privacy Policy</Title>
			<Paragraph>This Privacy Policy is effective as of (add date) and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.</Paragraph>
			<Paragraph>We reserve the right to update or change our Privacy Policy at any time and you should check this Privacy Policy periodically. Your continued use of the Service after we post any modifications to the Privacy Policy on this page will constitute your acknowledgment of the modifications and your consent to abide and be bound by the modified Privacy Policy.</Paragraph>
			<Paragraph>If we make any material changes to this Privacy Policy, we will notify you either through the email address you have provided us, or by placing a prominent notice on our website.</Paragraph>
			<Title>Contact Us</Title>
			<Paragraph>If you have any questions about this Privacy Policy, please <Link onPress={() => {
				navigation.push('Feedback');
			}}>contact us</Link>.</Paragraph>
		</ScrollView>
	)
}
