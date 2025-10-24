import Config from "../Config";
import { GetMusicRequire, GetMusicResponse, PostMusicRequire } from "./type";

class Music extends Config {
  async getMusic(req: GetMusicRequire): Promise<GetMusicResponse | null> {
    try {
      const result = await this.db.getFirstAsync<GetMusicResponse>(
        `
          SELECT
            id,
            title,
            artist,
            album,
            album_art AS albumArt,
            lyrics,
            duration,
            year,
            date,
            copyright,
            file_url AS fileUrl,
            created_at AS createdAt,
            updated_at AS updateAt
          FROM music WHERE id = ?
        `,
        [req.id],
      );
      if (!result) return null;
      return result as GetMusicResponse;
    } catch (error) {
      console.error("Error getting musics:", error);
      return null;
    }
  }
  async postMusic(req: PostMusicRequire) {
    try {
      const result = await this.db.runAsync(
        `INSERT INTO music 
          (title, artist, album, album_art, lyrics, duration, year, date, copyright, file_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.title ?? null,
          req.artist ?? null,
          req.album ?? null,
          req.albumArt ?? null,
          req.lyrics ?? null,
          req.duration ?? null,
          req.year ?? null,
          req.date ?? null,
          req.copyright ?? null,
          req.fileUrl ?? null,
        ],
      );

      return result.lastInsertRowId;
    } catch (error) {
      console.error("Error posting music:", error);
    }
  }

  async getMusics(): Promise<GetMusicResponse[]> {
    try {
      const result = await this.db.getAllAsync<GetMusicResponse>(
        `
          SELECT
            music.id,
            title,
            artist,
            album,
            album_art AS albumArt,
            lyrics,
            duration,
            year,
            date,
            copyright,
            file_url AS fileUrl,
            created_at AS createdAt,
            updated_at AS updateAt,
            local_file_path.path AS localFilePath
          FROM music LEFT JOIN local_file_path ON music.id = local_file_path.music_id
        `,
      );
      if (!result) return [];
      return result as GetMusicResponse[];
    } catch (error) {
      console.error("Error getting musics:", error);
      return [];
    }
  }
}

export default Music;
