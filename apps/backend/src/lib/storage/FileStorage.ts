export interface FileStorage {
  save(key: string, data: Buffer, contentType: string): Promise<void>;
  delete(key:string): Promise<void>
}
