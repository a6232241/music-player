import * as SQLite from "expo-sqlite";
import { migrateDbIfNeeded } from "../sqlite/init";
import File from "./File";
import Sqlite from "./Sqlite";

class Apis {
  private db: SQLite.SQLiteDatabase | null = null;
  sqlite: Sqlite | null = null;
  private origin: string = "http://localhost:3000";
  file: File = new File(this.origin);

  async init() {
    this.db = await SQLite.openDatabaseAsync("main.db");
    const result = await migrateDbIfNeeded(this.db);

    this.sqlite = new Sqlite(this.db);
    return result;
  }
}

export default new Apis();
