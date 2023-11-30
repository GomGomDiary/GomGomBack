export interface CacheInterfaceRepository {
  del(target: string, diaryId: string): Promise<void>;
  keys(): Promise<string[]>;
}
