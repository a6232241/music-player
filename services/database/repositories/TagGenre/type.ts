type TagGenreType = {
  id: number;
  name: string;
};

type TagType = {
  id: number;
  name: string;
};

type GetTagGenreIncludeTagsResponse = TagGenreType & {
  tags: TagType[];
};

export { GetTagGenreIncludeTagsResponse, TagGenreType, TagType };
