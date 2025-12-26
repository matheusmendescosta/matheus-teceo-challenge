import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Gera uma chave de cache baseada em parâmetros da requisição
   * Ex: "orders:list:0:10:filter=david"
   */
  generateCacheKey(module: string, params: Record<string, any>): string {
    const sorted = Object.keys(params)
      .sort()
      .map((key) => `${key}=${JSON.stringify(params[key])}`)
      .join(':');
    return `${module}:${sorted}`;
  }

  /**
   * Salva dados no cache com TTL (Time To Live)
   */
  async set<T>(
    key: string,
    value: T,
    ttlSeconds: number = 300, // 5 minutos por padrão
  ): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttlSeconds * 1000);
    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error);
      // Continua mesmo se cache falhar
    }
  }

  /**
   * Busca dados do cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      console.error('❌ Erro ao buscar cache:', error);
      return undefined;
    }
  }

  /**
   * Remove uma chave do cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error('❌ Erro ao deletar cache:', error);
    }
  }

  /**
   * Remove todas as chaves que começam com um padrão
   * Ex: invalidatePattern("orders:*") remove todas as listas de orders
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Pega todas as chaves do cache
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const store = this.cacheManager.store as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const keys = store.keys ? await store.keys() : [];

      if (!Array.isArray(keys)) {
        console.warn('⚠️ Não conseguiu obter chaves do cache');
        return;
      }

      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}`);

      for (const key of keys) {
        if (regex.test(key as string)) {
          await this.cacheManager.del(key);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao invalidar padrão de cache:', error);
    }
  }

  /**
   * Limpa todo o cache
   */
  async flush(): Promise<void> {
    try {
      await this.cacheManager.reset();
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }
}
