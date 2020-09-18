import React from 'react';
import Terms from '../../routes/connected/pages/Terms';
import Privacy from '../../routes/connected/pages/Privacy';
import About from '../../routes/connected/pages/About';
import I18n from "../../locales/i18n";

export default function Page(props) {

	props.navigation.setOptions({
		title: I18n.t('title.' + props.route.params.slug),
	});

	switch (props.route.params.slug) {
		case 'terms': return <Terms {...props} />;
		case 'privacy': return <Privacy {...props} />;
		case 'about': return <About {...props} />;
	}

	return page;
}
