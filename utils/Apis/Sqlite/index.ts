import * as SQLite from "expo-sqlite";
import Config from "./Config";
import LocalFilePath from "./LocalFilePath";
import Music from "./Music";
import TagGenre from "./TagGenre";

class Sqlite extends Config {
  music: Music;
  localFilePath: LocalFilePath;
  tagGenre: TagGenre;

  constructor(db: SQLite.SQLiteDatabase) {
    super(db);
    this.music = new Music(this.db);
    this.localFilePath = new LocalFilePath(this.db);
    this.tagGenre = new TagGenre(this.db);
  }
}

export default Sqlite;
