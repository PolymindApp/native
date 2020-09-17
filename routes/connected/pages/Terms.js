import React from 'react';
import { ScrollView } from 'react-native';
import { Title, Paragraph } from 'react-native-paper';
import { styles } from '../../../styles';

export default function Terms() {
	return (
		<ScrollView contentContainerStyle={[styles.inner]}>

			<Title>Introduction</Title>
			<Paragraph>These Application Standard Terms and Conditions written on this app shall manage your use of our
				Application, Polymind accessible at polymind.app.</Paragraph>
			<Paragraph>These Terms will be applied fully and affect to your use of this Application. By using this Application, you
				agreed to accept all terms and conditions written in here. You must not use this Application if you disagree
				with any of these Application Standard Terms and Conditions.</Paragraph>
			<Paragraph>Minors or people below 18 years old are not allowed to use this Application.</Paragraph>
			<Title>Intellectual Property Rights</Title>
			<Paragraph>Other than the content you own, under these Terms, Polymind and/or its
				licensors own all the intellectual property rights and materials contained in this Application.</Paragraph>
			<Paragraph>You are granted limited license only for purposes of viewing the material contained on this Application.</Paragraph>
			<Title>Restrictions</Title>
			<Paragraph>You are specifically restricted from all of the following:</Paragraph>
			{/*<ul>*/}
			{/*	<li>publishing any Application material in any other media;</li>*/}
			{/*	<li>selling, sublicensing and/or otherwise commercializing any Application material;</li>*/}
			{/*	<li>publicly performing and/or showing any Application material;</li>*/}
			{/*	<li>using this Application in any way that is or may be damaging to this Application;</li>*/}
			{/*	<li>using this Application in any way that impacts user access to this Application;</li>*/}
			{/*	<li>using this Application contrary to applicable laws and regulations, or in any way may cause harm to the*/}
			{/*		Application, or to any person or business entity;*/}
			{/*	</li>*/}
			{/*	<li>engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to*/}
			{/*		this Application;*/}
			{/*	</li>*/}
			{/*	<li>using this Application to engage in any advertising or marketing.</li>*/}
			{/*</ul>*/}
			<Paragraph>Certain areas of this Application are restricted from being access by you and Polymind may further restrict access by you to any areas of this Application, at
				any time, in absolute discretion. Any user ID and password you may have for this Application are confidential
				and you must maintain confidentiality as well.</Paragraph>
			<Title>Your Content</Title>
			<Paragraph>In these Application Standard Terms and Conditions, “Your Content” shall mean any audio, video text, images or
				other material you choose to display on this Application. By displaying Your Content, you grant Polymind a non-exclusive, worldwide irrevocable, sub licensable license to use,
				reproduce, adapt, publish, translate and distribute it in any and all media.</Paragraph>
			<Paragraph>Your Content must be your own and must not be invading any third-party's rights. Polymind reserves the right to remove any of Your Content from this Application at
				any time without notice.</Paragraph>
			<Title>No warranties</Title>
			<Paragraph>This Application is provided “as is,” with all faults, and Polymind express no
				representations or warranties, of any kind related to this Application or the materials contained on this
				Application. Also, nothing contained on this Application shall be interpreted as advising you.</Paragraph>
			<Title>Limitation of liability</Title>
			<Paragraph>In no event shall Polymind, nor any of its officers, directors and employees,
				shall be held liable for anything arising out of or in any way connected with your use of this Application
				whether such liability is under contract. Polymind, including its
				officers, directors and employees shall not be held liable for any indirect, consequential or special liability
				arising out of or in any way related to your use of this Application.</Paragraph>
			<Title>Indemnification</Title>
			<Paragraph>You hereby indemnify to the fullest extent Polymind from and against any
				and/or all liabilities, costs, demands, causes of action, damages and expenses arising in any way related to
				your breach of any of the provisions of these Terms.</Paragraph>
			<Title>Severability</Title>
			<Paragraph>If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted
				without affecting the remaining provisions herein.</Paragraph>
			<Title>Variation of Terms</Title>
			<Paragraph>Polymind is permitted to revise these Terms at any time as it sees fit, and by
				using this Application you are expected to review these Terms on a regular basis.</Paragraph>
			<Title>Assignment</Title>
			<Paragraph>The Polymind is allowed to assign, transfer, and subcontract its rights and/or
				obligations under these Terms without any notification. However, you are not allowed to assign, transfer, or
				subcontract any of your rights and/or obligations under these Terms.</Paragraph>
			<Title>Entire Agreement</Title>
			<Paragraph>These Terms constitute the entire agreement between Polymind and you in
				relation to your use of this Application, and supersede all prior agreements and understandings.</Paragraph>
			<Title>Governing Law & Jurisdiction</Title>
			<Paragraph>These Terms will be governed by and interpreted in accordance with the laws of the State of Quebec, and you submit to the non-exclusive jurisdiction of the state and federal
				courts located in Canada for the resolution of any disputes.</Paragraph>
		</ScrollView>
	)
}
