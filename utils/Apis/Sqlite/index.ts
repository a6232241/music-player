import * as SQLite from "expo-sqlite";
import Config from "./Config";

class Sqlite extends Config {
  constructor(db: SQLite.SQLiteDatabase) {
    super(db);
  }
}

export default Sqlite;
