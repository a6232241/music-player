import { SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<{ success: boolean }> {
  try {
    const DATABASE_VERSION = 1;
    let currentDbVersion =
      (await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version"))?.user_version ?? null;

    if (currentDbVersion === null || currentDbVersion >= DATABASE_VERSION) {
      return { success: true };
    }

    if (currentDbVersion === 0) {
      await db.execAsync(`
        PRAGMA journal_mode = 'wal';

        CREATE TABLE IF NOT EXISTS music (
          id INTEGER NOT NULL PRIMARY KEY,
          title TEXT NOT NULL,
          artist TEXT NOT NULL,
          album TEXT,
          duration INTEGER,
          year INTEGER,
          genre TEXT,
          file_path TEXT NOT NULL,
          play_count INTEGER DEFAULT 0,
          last_played_at TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tag_type (
          id INTEGER NOT NULL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tag (
          id INTEGER NOT NULL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          tag_type_id INTEGER NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (tag_type_id) REFERENCES tag_type (id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS music_tag (
          id INTEGER NOT NULL PRIMARY KEY,
          music_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (music_id) REFERENCES music (id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE,
          UNIQUE (music_id, tag_id)
        );

        CREATE INDEX IF NOT EXISTS idx_music_tag_music_id ON music_tag (music_id);
        CREATE INDEX IF NOT EXISTS idx_music_tag_tag_id ON music_tag (tag_id);

        INSERT INTO tag_type (name) VALUES ('流派');
        INSERT INTO tag_type (name) VALUES ('心情');
        INSERT INTO tag_type (name) VALUES ('場景');
        INSERT INTO tag_type (name) VALUES ('語言');
        INSERT INTO tag_type (name) VALUES ('年代');

        INSERT INTO tag (name, tag_type_id) VALUES ('古典', 1);
        INSERT INTO tag (name, tag_type_id) VALUES ('搖滾', 1);
        INSERT INTO tag (name, tag_type_id) VALUES ('流行', 1);
        INSERT INTO tag (name, tag_type_id) VALUES ('電子', 1);
        INSERT INTO tag (name, tag_type_id) VALUES ('嘻哈', 1);

        INSERT INTO tag (name, tag_type_id) VALUES ('開心', 2);
        INSERT INTO tag (name, tag_type_id) VALUES ('興奮', 2);
        INSERT INTO tag (name, tag_type_id) VALUES ('放鬆', 2);
        INSERT INTO tag (name, tag_type_id) VALUES ('焦慮', 2);
        INSERT INTO tag (name, tag_type_id) VALUES ('緊張', 2);
        INSERT INTO tag (name, tag_type_id) VALUES ('浪漫', 2);
        INSERT INTO tag (name, tag_type_id) VALUES ('傷感', 2);
        INSERT INTO tag (name, tag_type_id) VALUES ('憤怒', 2);

        INSERT INTO tag (name, tag_type_id) VALUES ('學習', 3);
        INSERT INTO tag (name, tag_type_id) VALUES ('寧靜', 3);
        INSERT INTO tag (name, tag_type_id) VALUES ('工作', 3);
        INSERT INTO tag (name, tag_type_id) VALUES ('運動', 3);
        INSERT INTO tag (name, tag_type_id) VALUES ('派對', 3);

        INSERT INTO tag (name, tag_type_id) VALUES ('英文', 4);
        INSERT INTO tag (name, tag_type_id) VALUES ('日文', 4);
        INSERT INTO tag (name, tag_type_id) VALUES ('中文', 4);
        INSERT INTO tag (name, tag_type_id) VALUES ('韓文', 4);
        INSERT INTO tag (name, tag_type_id) VALUES ('粵文', 4);
        INSERT INTO tag (name, tag_type_id) VALUES ('西班牙文', 4);
        
        INSERT INTO tag (name, tag_type_id) VALUES ('1960年代', 5);
        INSERT INTO tag (name, tag_type_id) VALUES ('1980年代', 5);
        INSERT INTO tag (name, tag_type_id) VALUES ('1990年代', 5);
        INSERT INTO tag (name, tag_type_id) VALUES ('2000年代', 5);
        INSERT INTO tag (name, tag_type_id) VALUES ('2010年代', 5);
        INSERT INTO tag (name, tag_type_id) VALUES ('2020年代', 5);
    `);

      currentDbVersion = 1;
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  } catch (error) {
    console.error("Error during database migration:", error);
    return { success: false };
  }
  return { success: true };
}
