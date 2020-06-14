import I18n from 'react-native-i18n';
import moment from "moment";
import 'moment/locale/fr';
import 'moment/locale/es';
import 'moment/locale/it';
import en from './en.json';
import fr from './fr.json';
import es from './es.json';
import it from './it.json';

I18n.fallbacks = true;
I18n.translations = { en, fr, es, it };
I18n.defaultLocale = 'en';

moment.updateLocale(I18n.locale.substring(0, 2));

export default I18n;
