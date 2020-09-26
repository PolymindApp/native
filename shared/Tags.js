import React from 'react';
import I18n from "../locales/i18n";
import db from "../shared/Database";
import Icon from "../shared/Icon";
import { Alert, View } from 'react-native';
import { Chip, Snackbar } from 'react-native-paper';
import { styles, small } from '../styles';

export default function Tags({ items, selected, selectable = true, removable = true, style, onPress, onLongPress, onItemsUpdate, onRemove, ...rest }) {

	const [state, setState] = React.useState({
		removed: false,
	});

	const toggle = function(selected, id) {

		if (!selectable) {
			return;
		}

		const _selected = [ ...selected ];
		const index = _selected.indexOf(id);
		if (index === -1) {
			_selected.push(id);
		} else {
			_selected.splice(index, 1);
		}

		setState(prev => ({ ...prev, selected: _selected }));
	}

	const remove = function(items, index, force = false) {

		if (!removable) {
			return;
		}

		if (!force) {
			Alert.alert(I18n.t('alert.removeTagsTitle'), I18n.t('alert.removeTagsDesc'), [
				{ text: I18n.t('btn.remove'), onPress: () => {
					remove(items, index, true);
				}, style: 'destructive' },
				{ text: I18n.t('btn.cancel'), style: "cancel" }
			], { cancelable: false });
		} else {
			const _items = [ ...items ];
			const tag = _items[index];

			db.transaction(tx => {
				tx.executeSql("update tags set archived = 1 where id = ?", [tag.id]);
				tx.executeSql("update cards_tags set archived = 1 where tag_id = ?", [tag.id]);
			}, null);

			_items.splice(index, 1);
			items.splice(index, 1);

			setState(prev => ({ ...prev, items: _items, removed: true }));
		}
	};

	return (
		<View style={[styles.horizontal, styles.wrap, {
			marginBottom: -small
		}, style]}>
			{items.map((item, itemIdx) => {
				const active = selected.indexOf(item.id) !== -1;
				const style = {
					marginRight: small,
					marginBottom: small,
				};
				const textStyle = {};
				const icon = active ? () => <Icon name={'check-circle'} color={item.dark ? 'white' : null} size={16} /> : null;
				if (active) {
					style.backgroundColor = item.color;
					textStyle.color = item.dark ? 'white' : null;
				}

				return (
					<Chip
						key={item.id}
						selected={active}
						ellipsizeMode={'tail'}
						style={style}
						textStyle={textStyle}
						icon={icon}
						onPress={() => {

							if (selectable) {
								toggle(selected, item.id);
							}

							if (onPress instanceof Function) {
								onPress(item, itemIdx);
							}
						}}
						onLongPress={() => {

							if (removable) {
								remove(items, itemIdx);
							}

							if (onLongPress instanceof Function) {
								onLongPress(item, itemIdx);
							}
						}}
						{...rest}
					>
						{item.key}
					</Chip>
				);
			})}

			<Snackbar
				visible={state.removed}
				duration={1000}
				onDismiss={() => setState(prev => ({ ...prev, removed: false }))}
			>
				Tag removed!
			</Snackbar>
		</View>
	);
}
