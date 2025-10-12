import Config from "../Config";
import { GetMusicsResponse, PostMusicRequire } from "./type";

class Music extends Config {
  async postMusic(music: PostMusicRequire) {
    try {
      await this.db.runAsync(
        `INSERT INTO music (title, artist, album, duration, year, date, picture, file_path) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
        music?.title ?? null,
        music?.artist ?? null,
        music?.album ?? null,
        music?.duration ?? null,
        music?.year ?? null,
        music?.date ?? null,
        music?.picture ?? null,
        music?.filePath ?? null,
      );
    } catch (error) {
      console.log("Error posting music:", error);
    }
  }

  async getMusics(): Promise<GetMusicsResponse[]> {
    try {
      const result = await this.db.getAllAsync(
        `
          SELECT
            id,
            title,
            artist,
            album,
            duration,
            year,
            date,
            picture,
            file_path as filePath,
            play_count as playCount,
            last_played_at as lastPlayedAt,
            created_at as createdAt,
            update_at as updateAt,
          FROM music ORDER BY created_at DESC
        `,
      );
      if (!result) return [];
      return result as GetMusicsResponse[];
    } catch (error) {
      console.error("Error getting musics:", error);
      return [];
    }
  }
}

export default Music;
