import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase('polymind.db', 1);

db.transaction(tx => {
	tx.executeSql(`create table if not exists words (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		front TEXT NOT NULL,
		back TEXT NOT NULL,
		frontLang TEXT NOT NULL,
		backLang TEXT NOT NULL,
		createdOn DATE DEFAULT CURRENT_TIMESTAMP,
		archived BOOLEAN DEFAULT 0
    );`);
});

export default db;
