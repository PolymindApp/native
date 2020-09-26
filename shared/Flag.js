import * as React from "react";
import flag_cmn from '../assets/flags/CN.png';
import flag_fr from '../assets/flags/FR.png';
import flag_en from '../assets/flags/GB.png';
import flag_es from '../assets/flags/ES.png';
import flag_it from '../assets/flags/IT.png';
import flag_cy from '../assets/flags/_wales.png';
import flag_da from '../assets/flags/DK.png';
import flag_de from '../assets/flags/DE.png';
import flag_is from '../assets/flags/IS.png';
import flag_ja from '../assets/flags/JP.png';
import flag_hi from '../assets/flags/IN.png';
import flag_ko from '../assets/flags/KR.png';
import flag_nb from '../assets/flags/NO.png';
import flag_nl from '../assets/flags/NL.png';
import flag_pl from '../assets/flags/PL.png';
import flag_pt from '../assets/flags/PT.png';
import flag_ro from '../assets/flags/RO.png';
import flag_ru from '../assets/flags/RU.png';
import flag_sv from '../assets/flags/SV.png';
import flag_tr from '../assets/flags/TR.png';
import placeholder from '../assets/flags/placeholder.png';
import { Image } from 'react-native';

export default class Flag extends React.Component {

	render() {

		const { lang, size, style, ...rest } = this.props;
		const matches = {
			cmn: flag_cmn,
			fr: flag_fr,
			en: flag_en,
			es: flag_es,
			it: flag_it,

			cy: flag_cy,
			da: flag_da,
			de: flag_de,
			is: flag_is,
			ja: flag_ja,
			hi: flag_hi,
			ko: flag_ko,
			nb: flag_nb,
			nl: flag_nl,
			pl: flag_pl,
			pt: flag_pt,
			ro: flag_ro,
			ru: flag_ru,
			sv: flag_sv,
			tr: flag_tr,
		};

		const source = matches[lang] ? matches[lang] : placeholder;

		return <Image source={source} style={[{
			width: size,
			height: size,
		}, style]} {...rest} />
	}
}
