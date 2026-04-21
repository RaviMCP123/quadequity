import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

export class FileHelper {
  static saveFile(buffer: Buffer, filename: string, directory: string): string {
    const filePath = path.join(directory, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  static generateUniqueFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}${ext}`;
    return uniqueName;
  }

  static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  static createDirectoryIfNotExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  static async resizeAndSaveImage(
    buffer: Buffer,
    filename: string,
    directory: string,
    width: number,
    height: number,
  ): Promise<string> {
    const thumbPath = path.join(directory, filename);
    await sharp(buffer)
      .resize(width, height, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toFile(thumbPath);
    return thumbPath;
  }

  static unlinkFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
