import { theme } from "../theme";

const awsLanguages = ['en', 'fr', 'es', 'it', 'cmn', 'cy', 'da', 'de', 'is', 'ja', 'hi', 'ko', 'nb', 'nl', 'pl', 'pt', 'ro', 'ru', 'sv', 'tr',];
const googleTranslateLanguages = ['af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'zh-CN', 'zh-TW', 'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'haw', 'he', 'hi', 'hmn', 'hu', 'is', 'ig', 'id', 'ga', 'it', 'ja', 'jv', 'kn', 'kk', 'km', 'rw', 'ko', 'ku', 'ky', 'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my', 'ne', 'no', 'ny', 'or', 'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 'tl', 'tg', 'ta', 'tt', 'te', 'th', 'tr', 'tk', 'uk', 'ur','ug','uz','vi','cy','xh','yi','yo','zu',];

const nativeLanguageNames = { en: 'English', fr: 'Français', es: 'Español' };
const notAwsLanguages = googleTranslateLanguages.filter(lang => awsLanguages.indexOf(lang) === -1);

const awsTranscribeSupportedLanguageCode = ['af-ZA', 'ar-AE', 'ar-SA', 'cy-GB', 'da-DK', 'de-CH', 'de-DE', 'en-AB', 'en-AU', 'en-GB', 'en-IE', 'en-IN', 'en-US', 'en-WL', 'es-ES', 'es-US', 'fa-IR', 'fr-CA', 'fr-FR', 'ga-IE', 'gd-GB', 'he-IL', 'hi-IN', 'id-ID', 'it-IT', 'ja-JP', 'ko-KR', 'ms-MY', 'nl-NL', 'pt-BR', 'pt-PT', 'ru-RU', 'ta-IN', 'te-IN', 'tr-TR', 'zh-CN'];

const pollyVoices = [
	{ locale: 'arb', name: 'Zeina', gender: 1, adult: true , default: true, },
	{ locale: 'cmn-CN', name: 'Zhiyu', gender: 1, adult: true , default: true, },
	{ locale: 'da-DK', name: 'Naja', gender: 1, adult: true , default: true, },
	{ locale: 'da-DK', name: 'Mads', gender: 0, adult: true , default: false, },
	{ locale: 'nl-NL', name: 'Lotte', gender: 1, adult: true , default: true, },
	{ locale: 'nl-NL', name: 'Ruben', gender: 0, adult: true , default: false, },
	{ locale: 'en-US', name: 'Ivy', gender: 1, adult: false , default: false, },
	{ locale: 'en-US', name: 'Joanna', gender: 1, adult: true , default: true, },
	{ locale: 'en-US', name: 'Kendra', gender: 1, adult: true , default: false, },
	{ locale: 'en-US', name: 'Kimberly', gender: 1, adult: true , default: false, },
	{ locale: 'en-US', name: 'Salli', gender: 1, adult: true , default: false, },
	{ locale: 'en-US', name: 'Joey', gender: 0, adult: true , default: false, },
	{ locale: 'en-US', name: 'Justin', gender: 0, adult: false , default: false, },
	{ locale: 'en-US', name: 'Kevin', gender: 0, adult: false , default: false, },
	{ locale: 'en-US', name: 'Matthew', gender: 0, adult: true , default: false, },
	{ locale: 'en-IN', name: 'Aditi', gender: 1, adult: true , default: false, },
	{ locale: 'en-IN', name: 'Raveena', gender: 1, adult: true , default: false, },
	{ locale: 'en-GB', name: 'Amy', gender: 1, adult: true , default: false, },
	{ locale: 'en-GB', name: 'Emma', gender: 1, adult: true , default: false, },
	{ locale: 'en-GB', name: 'Brian', gender: 0, adult: true , default: false, },
	{ locale: 'en-GB-WLS', name: 'Geraint', gender: 0, adult: true , default: false, },
	{ locale: 'en-AU', name: 'Nicole', gender: 1, adult: true , default: false, },
	{ locale: 'en-AU', name: 'Russell', gender: 0, adult: true , default: false, },
	{ locale: 'fr-FR', name: 'Céline', gender: 1, adult: true , default: false, },
	{ locale: 'fr-FR', name: 'Léa', gender: 1, adult: true , default: true, },
	{ locale: 'fr-FR', name: 'Mathieu', gender: 0, adult: true , default: false, },
	{ locale: 'fr-CA', name: 'Chantal', gender: 1, adult: true , default: false, },
	{ locale: 'de-DE', name: 'Marlene', gender: 1, adult: true , default: true, },
	{ locale: 'de-DE', name: 'Vicki', gender: 1, adult: true , default: false, },
	{ locale: 'de-DE', name: 'Hans', gender: 0, adult: true , default: false, },
	{ locale: 'hi-IN', name: 'Aditi', gender: 1, adult: true , default: true, },
	{ locale: 'is-IS', name: 'Dóra', gender: 1, adult: true , default: true, },
	{ locale: 'is-IS', name: 'Karl', gender: 0, adult: true , default: false, },
	{ locale: 'it-IT', name: 'Carla', gender: 1, adult: true , default: false, },
	{ locale: 'it-IT', name: 'Bianca', gender: 1, adult: true , default: false, },
	{ locale: 'it-IT', name: 'Giorgio', gender: 0, adult: true , default: true, },
	{ locale: 'ja-JP', name: 'Mizuki', gender: 1, adult: true , default: true, },
	{ locale: 'ja-JP', name: 'Takumi', gender: 0, adult: true , default: false, },
	{ locale: 'ko-KR', name: 'Seoyeon', gender: 0, adult: true , default: true, },
	{ locale: 'nb-NO', name: 'Liv', gender: 1, adult: true , default: true, },
	{ locale: 'pl-PL', name: 'Ewa', gender: 1, adult: true , default: true, },
	{ locale: 'pl-PL', name: 'Maja', gender: 1, adult: true , default: false, },
	{ locale: 'pl-PL', name: 'Jacek', gender: 0, adult: true , default: false, },
	{ locale: 'pl-PL', name: 'Jan', gender: 0, adult: true , default: false, },
	{ locale: 'pt-BR', name: 'Camila', gender: 1, adult: true , default: false, },
	{ locale: 'pt-BR', name: 'Vitória', gender: 1, adult: true , default: false, },
	{ locale: 'pt-BR', name: 'Ricardo', gender: 0, adult: true , default: true, },
	{ locale: 'pt-PT', name: 'Inês', gender: 1, adult: true , default: false, },
	{ locale: 'pt-PT', name: 'Cristiano', gender: 0, adult: true , default: false, },
	{ locale: 'ro-RO', name: 'Carmen', gender: 1, adult: true , default: true, },
	{ locale: 'ru-RU', name: 'Tatyana', gender: 1, adult: true , default: true, },
	{ locale: 'ru-RU', name: 'Maxim', gender: 0, adult: true , default: false, },
	{ locale: 'es-ES', name: 'Conchita', gender: 1, adult: true , default: false, },
	{ locale: 'es-ES', name: 'Lucia', gender: 1, adult: true , default: false, },
	{ locale: 'es-ES', name: 'Enrique', gender: 0, adult: true , default: true, },
	{ locale: 'es-MX', name: 'Mia', gender: 1, adult: true , default: false, },
	{ locale: 'es-US', name: 'Lupe', gender: 1, adult: true , default: false, },
	{ locale: 'es-US', name: 'Penélope', gender: 1, adult: true , default: false, },
	{ locale: 'es-US', name: 'Miguel', gender: 0, adult: true , default: false, },
	{ locale: 'sv-SE', name: 'Astrid', gender: 1, adult: true , default: true, },
	{ locale: 'tr-TR', name: 'Filiz', gender: 1, adult: true , default: true, },
	{ locale: 'cy-GB', name: 'Gwyneth', gender: 1, adult: true , default: true, },
];

const sortOrderItem = [
	{ title: 'ASC', key: 'asc', },
	{ title: 'DESC', key: 'desc', },
];

const sortItems = [
	{ title: 'Date added', key: 'date', },
	{ title: 'Difficulty', key: 'difficulty', },
	{ title: 'Alphabetically', key: 'alphanum', },
];

const difficulties = [
	{ color: theme.colors.success, dark: true, id: 'easy', key: 'easy' },
	{ color: theme.colors.warning, dark: false, id: 'medium', key: 'medium' },
	{ color: theme.colors.error, dark: true, id: 'hard', key: 'hard' },
];

export {
	difficulties,
	sortOrderItem,
	sortItems,
	awsLanguages,
	googleTranslateLanguages,
	notAwsLanguages,
	nativeLanguageNames,
	pollyVoices,
}
