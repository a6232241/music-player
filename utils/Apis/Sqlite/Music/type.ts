import { SortType } from "@/components/SortSelect";

type MusicType = {
  id: number;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  lyrics?: string;
  duration?: number;
  year?: number;
  date?: string;
  copyright?: string;
  fileUrl?: string;
  fileName: string;
  md5?: string;
  createdAt: Date;
  updateAt: Date;
};

type PostMusicRequire = Omit<MusicType, "id" | "createdAt" | "updateAt">;

type GetMusicRequire = { id: number };
type GetMusicResponse = MusicType;

type GetMusicByTagRequire = { ids: number[]; sortType?: SortType };
type GetMusicByTagResponse = MusicType;

type GetMusicsRequire = {
  sortType?: SortType;
};

export {
  GetMusicByTagRequire,
  GetMusicByTagResponse,
  GetMusicRequire,
  GetMusicResponse,
  GetMusicsRequire,
  MusicType,
  PostMusicRequire,
};
