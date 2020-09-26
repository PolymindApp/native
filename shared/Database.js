import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase('polymind.db', 1);

db.transaction(tx => {

	// tx.executeSql('drop table cards');
	// tx.executeSql('drop table tags');
	// tx.executeSql('drop table cards_tags');
	// tx.executeSql('drop table sessions');
	// tx.executeSql('drop table stats');

	// Cards
	tx.executeSql(`create table if not exists cards (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		front TEXT NOT NULL,
		back TEXT NOT NULL,
		frontLang TEXT NOT NULL,
		backLang TEXT NOT NULL,
		createdOn DATE DEFAULT CURRENT_TIMESTAMP,
		modifiedOn DATE DEFAULT NULL,
		archived BOOLEAN DEFAULT 0
    );`);

	// Tags
	tx.executeSql(`create table if not exists tags (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		key TEXT NOT NULL,
		color TEXT NOT NULL,
		dark INTEGER DEFAULT 0,
		system INTEGER DEFAULT 0,
		createdOn DATE DEFAULT CURRENT_TIMESTAMP,
		modifiedOn DATE DEFAULT NULL,
		archived BOOLEAN DEFAULT 0
    );`);

	// Cards/tags relation
	tx.executeSql(`create table if not exists cards_tags (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		card_id INTEGER NOT NULL,
		tag_id INTEGER NOT NULL,
		createdOn DATE DEFAULT CURRENT_TIMESTAMP
    );`);

	// Sessions
	tx.executeSql(`create table if not exists sessions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT NOT NULL,
		tags TEXT,
		difficulties TEXT,
		sortAttr TEXT DEFAULT 'date',
		sortOrder TEXT DEFAULT 'desc',
		createdOn DATE DEFAULT CURRENT_TIMESTAMP,
		modifiedOn DATE DEFAULT NULL,
		archived BOOLEAN DEFAULT 0
    );`);

	// Stats
	tx.executeSql(`create table if not exists stats (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		card_id INTEGER NOT NULL,
		tag_id INTEGER NOT NULL,
		createdOn DATE DEFAULT CURRENT_TIMESTAMP,
		modifiedOn DATE DEFAULT NULL,
		archived BOOLEAN DEFAULT 0
    );`);

	// Insert system tags..
	// tx.executeSql("select * from tags where system = 1", [], (_, { rows }) => {
	// 	if (rows._array.length === 0) {
	// 		tx.executeSql(`insert into tags (key, color, dark, system) values(?, ?, ?, ?)`, ['easy', theme.colors.success, true, 1,]);
	// 		tx.executeSql(`insert into tags (key, color, dark, system) values(?, ?, ?, ?)`, ['medium', theme.colors.warning, false, 1,]);
	// 		tx.executeSql(`insert into tags (key, color, dark, system) values(?, ?, ?, ?)`, ['hard', theme.colors.error, true, 1,]);
	// 	}
	// });
});

export default db;
