import Config from "../Config";
import { PostMusicTagsRequire } from "./type";

class MusicTag extends Config {
  async postMusicTags(req: PostMusicTagsRequire): Promise<void> {
    try {
      const statement = await this.db.prepareAsync(
        `INSERT INTO music_tag 
        (music_id, tag_id)
        VALUES (?, ?)`,
      );

      await Promise.all(
        req.tagIds.map(async (tagId) => {
          statement.executeAsync(req.musicId, tagId);
        }),
      );
    } catch (error) {
      console.error("Error posting music tags:", error);
    }
  }
}

export default MusicTag;
