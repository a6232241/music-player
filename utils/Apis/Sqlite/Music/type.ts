type OnlyLocalType = {
  isTemporary?: boolean;
};

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
  createdAt: Date;
  updateAt: Date;
} & OnlyLocalType;

type PostMusicRequire = Omit<MusicType, "id" | "createdAt" | "updateAt">;

type GetMusicRequire = { id: number };
type GetMusicResponse = MusicType;

export { GetMusicRequire, GetMusicResponse, MusicType, PostMusicRequire };
