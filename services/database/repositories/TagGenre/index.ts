import Config from "../Config";
import { GetTagGenreIncludeTagsResponse, TagGenreType, TagType } from "./type";

class TagGenre extends Config {
  async getTagGenresIncludeTags(): Promise<GetTagGenreIncludeTagsResponse[]> {
    let result: GetTagGenreIncludeTagsResponse[] = [];
    try {
      let tagGenreWithTags = await this.db.getAllAsync<TagGenreType & { tags: string }>(
        `
          SELECT
            tag_genre.id,
            tag_genre.name,
            (
              SELECT json_group_array(
                json_object('id', tag.id, 'name', tag.name)
              )
              FROM tag WHERE tag.tag_genre_id = tag_genre.id
            ) AS tags
          FROM tag_genre
        `,
      );

      result = tagGenreWithTags.map((tagGenre) => {
        return {
          ...tagGenre,
          tags: (JSON.parse(tagGenre.tags) ?? []) as TagType[],
        };
      });
    } catch (error) {
      console.error("Error getting tag types:", error);
    } finally {
      return result;
    }
  }
}

export default TagGenre;
