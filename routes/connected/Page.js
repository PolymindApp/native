import React from 'react';
import Terms from '../../routes/connected/pages/Terms';
import Privacy from '../../routes/connected/pages/Privacy';
import About from '../../routes/connected/pages/About';
import I18n from "../../locales/i18n";

export default function Page({ navigation, route }) {

	navigation.setOptions({
		title: I18n.t('title.' + route.params.slug),
	});

	switch (route.params.slug) {
		case 'terms': return <Terms />;
		case 'privacy': return <Privacy />;
		case 'about': return <About />;
	}

	return page;
}
