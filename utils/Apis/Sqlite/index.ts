import * as SQLite from "expo-sqlite";
import Config from "./Config";
import Music from "./Music";

class Sqlite extends Config {
  music: Music;

  constructor(db: SQLite.SQLiteDatabase) {
    super(db);
    this.music = new Music(this.db);
  }
}

export default Sqlite;
