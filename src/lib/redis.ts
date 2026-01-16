import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number,
  options: { bypassCache?: boolean } = {}
): Promise<T> {
  const { bypassCache = false } = options;
  const start = performance.now();

  if (!bypassCache) {
    try {
      const cached = await redis.get<T>(key)
      if (cached) {
        const end = performance.now();
        console.log(`[Redis] Cache HIT for ${key} - took ${(end - start).toFixed(2)}ms`);
        return cached
      }
    } catch (error: any) {
      if (error.digest === 'DYNAMIC_SERVER_USAGE') {
        throw error
      }
      console.error('Redis get error:', error)
      // Fallback to fetching fresh data if Redis fails
    }
  }

  const data = await fetcher()
  const end = performance.now();
  console.log(`[Redis] Cache MISS for ${key} - fetched in ${(end - start).toFixed(2)}ms`);

  try {
    // Only cache if data is returned
    if (data !== undefined && data !== null) {
      await redis.set(key, data, { ex: ttl })
    }
  } catch (error: any) {
    if (error.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error
    }
    console.error('Redis set error:', error)
  }

  return data
}

export default redis
