import * as SQLite from "expo-sqlite";
import Config from "./Config";
import Music from "./Music";
import MusicTag from "./MusicTag";
import TagGenre from "./TagGenre";

class Sqlite extends Config {
  music: Music;
  tagGenre: TagGenre;
  musicTag: MusicTag;

  constructor(db: SQLite.SQLiteDatabase) {
    super(db);
    this.music = new Music(this.db);
    this.tagGenre = new TagGenre(this.db);
    this.musicTag = new MusicTag(this.db);
  }
}

export default Sqlite;
