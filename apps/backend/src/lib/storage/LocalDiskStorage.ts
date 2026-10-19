import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FileStorage } from "./FileStorage.ts";

export class LocalDiskStorage implements FileStorage {
  private readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  private resolve(key: string): string {
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) {
      throw new Error(`Storage key escapes root: ${key}`);
    }
    return full;
  }
  async save(key: string, data: Buffer): Promise<void> {
    const full = this.resolve(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data, { flag: "wx" });
  }
  async delete(key: string): Promise<void> {
    const full = this.resolve(key);
    await rm(full, { force: true });
  }
}
