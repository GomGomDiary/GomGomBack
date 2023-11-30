export interface CacheInterfaceRepository {
  del(target: string): Promise<void>;
  keys(): Promise<string[]>;
}
