type MusicType = {
  id: number;
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  year?: number;
  date?: string;
  picture?: string;
  filePath: string;
  playCount: number;
  lastPlayedAt: Date;
  createdAt: Date;
  updateAt: Date;
};

type PostMusicRequire = Omit<MusicType, "id" | "playCount" | "lastPlayedAt" | "createdAt" | "updateAt">;

type GetMusicsResponse = MusicType;

export { GetMusicsResponse, MusicType, PostMusicRequire };
