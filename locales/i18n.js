import I18n from 'react-native-i18n';
import moment from "moment/min/moment-with-locales";
import en from './en.json';
import fr from './fr.json';
import es from './es.json';
import it from './it.json';

I18n.fallbacks = true;
I18n.translations = { en, fr, es, it };
I18n.defaultLocale = 'en';

const lang = I18n.locale.substring(0, 2);
moment.locale(lang);

export default I18n;
