import * as SQLite from "expo-sqlite";
import File from "./api/file";
import { migrateDbIfNeeded } from "./database/client";
import Sqlite from "./database/repositories";

class Apis {
  private db: SQLite.SQLiteDatabase | null = null;
  sqlite: Sqlite | null = null;
  private origin: string = "http://localhost:3000";
  file: File = new File(this.origin);

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync("main.db", { useNewConnection: true });
      const result = await migrateDbIfNeeded(this.db);
      this.sqlite = new Sqlite(this.db);

      return { ...result, db: this.db };
    } catch (error) {
      console.error("Error initializing the database:", error);
    }
  }

  async reloadDb() {
    try {
      this.db = await SQLite.openDatabaseAsync("main.db", { useNewConnection: true });
      this.sqlite = new Sqlite(this.db);

      return { isError: false };
    } catch (error) {
      console.error("Error reloading the database:", error);
    }
  }
}

export default new Apis();
