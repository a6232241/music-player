import * as SQLite from "expo-sqlite";

class Config {
  protected db: SQLite.SQLiteDatabase;

  constructor(db: SQLite.SQLiteDatabase) {
    this.db = db;
  }
}

export default Config;
