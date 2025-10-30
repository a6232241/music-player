import { SortType } from "@/components/SortSelect";
import Config from "../Config";
import {
  GetMusicByTagRequire,
  GetMusicByTagResponse,
  GetMusicRequire,
  GetMusicResponse,
  GetMusicsRequire,
  PostMusicRequire,
} from "./type";

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

  async getMusics(req?: GetMusicsRequire): Promise<GetMusicResponse[]> {
    let sortSQL = "";
    if (req?.sortType === SortType.DEFAULT) {
      sortSQL = `ORDER BY music.id ASC`;
    }
    if (req?.sortType === SortType.DATE_ASC) {
      sortSQL = `ORDER BY date ASC`;
    }
    if (req?.sortType === SortType.DATE_DESC) {
      sortSQL = `ORDER BY date DESC`;
    }

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
          FROM music LEFT JOIN local_file_path ON music.id = local_file_path.music_id ${sortSQL}
        `,
      );
      if (!result) return [];
      return result as GetMusicResponse[];
    } catch (error) {
      console.error("Error getting musics:", error);
      return [];
    }
  }

  async getMusicsByTagIds(req: GetMusicByTagRequire): Promise<GetMusicByTagResponse[]> {
    let result: GetMusicByTagResponse[] = [];
    const placeholders = req.ids.map(() => "?").join(",");
    let sortSQL = "";
    if (req?.sortType === SortType.DEFAULT) {
      sortSQL = `ORDER BY music.id ASC`;
    }
    if (req?.sortType === SortType.DATE_ASC) {
      sortSQL = `ORDER BY date ASC`;
    }
    if (req?.sortType === SortType.DATE_DESC) {
      sortSQL = `ORDER BY date DESC`;
    }

    try {
      result = await this.db.getAllAsync<GetMusicByTagResponse>(
        `
          SELECT
            music.id,
            music.title,
            music.artist,
            music.album,
            music.album_art AS albumArt,
            music.lyrics,
            music.duration,
            music.year,
            music.date,
            music.copyright,
            music.file_url AS fileUrl,
            music.created_at AS createdAt,
            music.updated_at AS updateAt,
            local_file_path.path AS localFilePath
          FROM (
            SELECT
              music.id
            FROM music
            INNER JOIN music_tag ON music.id = music_tag.music_id
            INNER JOIN tag ON music_tag.tag_id = tag.id
            WHERE tag.id IN (${placeholders})
            GROUP BY music.id
            HAVING COUNT(DISTINCT tag.id) = ${req.ids.length}
          ) AS filtered_musics
          INNER JOIN music ON filtered_musics.id = music.id
          LEFT JOIN local_file_path ON music.id = local_file_path.music_id ${sortSQL}
        `,
        req.ids,
      );
    } catch (error) {
      console.error("Error getting musics:", error);
    } finally {
      return result;
    }
  }
}

export default Music;
