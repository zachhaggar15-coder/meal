import { Redis } from '@upstash/redis';

const memoryBuckets = new Map();
const MAX_MEMORY_BUCKETS = 10000;
const KEY_PREFIX = 'mealprep:rate-limit:v1';

const HIT_SCRIPT = `
local result = {}
local window = tonumber(ARGV[1])
for _, key in ipairs(KEYS) do
  local count = redis.call('INCR', key)
  local ttl = redis.call('PTTL', key)
  if count == 1 or ttl < 0 then
    redis.call('PEXPIRE', key, window)
    ttl = window
  end
  table.insert(result, count)
  table.insert(result, ttl)
end
return result
`;

const REFUND_SCRIPT = `
local result = {}
for _, key in ipairs(KEYS) do
  local count = tonumber(redis.call('GET', key) or '0')
  if count > 0 then
    count = redis.call('DECR', key)
  end
  table.insert(result, count)
end
return result
`;

let cachedStore;
let testStore;

export function getRateLimitStore() {
  if (testStore) return testStore;
  if (cachedStore) return cachedStore;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    cachedStore = createRedisRateLimitStore(new Redis({
      url,
      token,
      signal: () => AbortSignal.timeout(1500),
      retry: { retries: 1, backoff: () => 50 },
    }));
    return cachedStore;
  }

  if (['production', 'preview'].includes(process.env.VERCEL_ENV || '')) {
    throw new Error('Distributed rate limiting is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
  }

  cachedStore = createMemoryRateLimitStore();
  return cachedStore;
}

export function createRedisRateLimitStore(redis) {
  return {
    kind: 'redis',
    async hit(keys, windowMs) {
      const result = await redis.eval(HIT_SCRIPT, keys.map(namespacedKey), [windowMs]);
      return decodeHitResult(result, keys.length);
    },
    async refund(keys) {
      await redis.eval(REFUND_SCRIPT, keys.map(namespacedKey), []);
    },
  };
}

export function createMemoryRateLimitStore() {
  return {
    kind: 'memory',
    async hit(keys, windowMs) {
      const now = Date.now();
      pruneMemoryBuckets(now);
      return keys.map(key => {
        const namespaced = namespacedKey(key);
        let bucket = memoryBuckets.get(namespaced);
        if (!bucket || bucket.resetAt <= now) {
          bucket = { count: 0, resetAt: now + windowMs };
          memoryBuckets.set(namespaced, bucket);
        }
        bucket.count += 1;
        return { count: bucket.count, ttlMs: Math.max(1, bucket.resetAt - now) };
      });
    },
    async refund(keys) {
      keys.forEach(key => {
        const bucket = memoryBuckets.get(namespacedKey(key));
        if (bucket && bucket.count > 0) bucket.count -= 1;
      });
    },
  };
}

export function setRateLimitStoreForTests(store) {
  testStore = store || undefined;
}

export function resetRateLimitStoreForTests() {
  testStore = undefined;
  cachedStore = undefined;
  memoryBuckets.clear();
}

function decodeHitResult(result, keyCount) {
  if (!Array.isArray(result) || result.length !== keyCount * 2) {
    throw new Error('Redis returned an invalid rate-limit result.');
  }

  return Array.from({ length: keyCount }, (_, index) => {
    const count = Number(result[index * 2]);
    const ttlMs = Number(result[(index * 2) + 1]);
    if (!Number.isFinite(count) || !Number.isFinite(ttlMs)) {
      throw new Error('Redis returned a non-numeric rate-limit result.');
    }
    return { count, ttlMs: Math.max(1, ttlMs) };
  });
}

function namespacedKey(key) {
  const environment = String(process.env.VERCEL_ENV || 'local').replace(/[^a-z0-9_-]/gi, '').slice(0, 24) || 'local';
  return `${KEY_PREFIX}:${environment}:${key}`;
}

function pruneMemoryBuckets(now) {
  if (memoryBuckets.size < MAX_MEMORY_BUCKETS) return;
  for (const [key, bucket] of memoryBuckets) {
    if (bucket.resetAt <= now) memoryBuckets.delete(key);
  }
}
