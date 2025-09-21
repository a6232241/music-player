import * as SQLite from "expo-sqlite";
import { migrateDbIfNeeded } from "../sqlite/init";
import Sqlite from "./Sqlite";

class Apis {
  private db: SQLite.SQLiteDatabase | null = null;
  sqlite: Sqlite | null = null;

  async init() {
    this.db = await SQLite.openDatabaseAsync("main.db");
    const result = await migrateDbIfNeeded(this.db);

    this.sqlite = new Sqlite(this.db);
    return result;
  }
}

export default new Apis();
