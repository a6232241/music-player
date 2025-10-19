import Config from "../Config";

type PostLocalFilePathRequire = {
  id: number;
  path: string;
};

class LocalFilePath extends Config {
  async postLocalFilePath(req: PostLocalFilePathRequire) {
    try {
      await this.db.runAsync(
        `INSERT INTO local_file_path 
          (music_id, path)
          VALUES (?, ?)`,
        [req.id, req.path],
      );
    } catch (error) {
      console.error("Error posting local file path:", error);
    }
  }
}

export default LocalFilePath;
