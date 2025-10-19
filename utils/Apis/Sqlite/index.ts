import * as SQLite from "expo-sqlite";
import Config from "./Config";
import LocalFilePath from "./LocalFilePath";
import Music from "./Music";

class Sqlite extends Config {
  music: Music;
  localFilePath: LocalFilePath;

  constructor(db: SQLite.SQLiteDatabase) {
    super(db);
    this.music = new Music(this.db);
    this.localFilePath = new LocalFilePath(this.db);
  }
}

export default Sqlite;
