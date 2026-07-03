type ApiTier = 1 | 2 | 3;

const TIER_LIMITS: Record<ApiTier, { low: number; high: number }> = {
  1: { low: 6, high: 20 },
  2: { low: 5, high: 100 },
  3: { low: 10, high: 150 },
};

interface TokenBucket {
  tokens: number;
  maxTokens: number;
  refillRate: number;
  lastRefill: number;
  windowMs: number;
}

export class RateLimiter {
  private buckets: Map<ApiTier, TokenBucket> = new Map();
  private queue: Array<{
    tier: ApiTier;
    resolve: () => void;
    reject: (err: Error) => void;
    timestamp: number;
  }> = [];
  private processing = false;
  private limitType: 'low' | 'high' = 'low';

  constructor() {
    for (const tier of [1, 2, 3] as ApiTier[]) {
      this.buckets.set(tier, this.createBucket(tier));
    }
  }

  private createBucket(tier: ApiTier): TokenBucket {
    const limits = TIER_LIMITS[tier];
    const maxTokens = this.limitType === 'high' ? limits.high : limits.low;
    return {
      tokens: maxTokens,
      maxTokens,
      refillRate: maxTokens / 60000,
      lastRefill: Date.now(),
      windowMs: 60000,
    };
  }

  updateFromHeaders(tier: ApiTier, headers: Headers): void {
    const limitType = headers.get('X-Figma-Rate-Limit-Type') as 'low' | 'high' | null;
    if (limitType && limitType !== this.limitType) {
      this.limitType = limitType;
      for (const [t, bucket] of this.buckets) {
        const limits = TIER_LIMITS[t as ApiTier];
        const newMax = limitType === 'high' ? limits.high : limits.low;
        bucket.maxTokens = newMax;
        bucket.tokens = Math.min(bucket.tokens, newMax);
        bucket.refillRate = newMax / 60000;
      }
    }

    const remaining = headers.get('X-Figma-Rate-Limit-Remaining');
    if (remaining !== null) {
      const bucket = this.buckets.get(tier);
      if (bucket) {
        bucket.tokens = Math.min(
          parseInt(remaining, 10),
          bucket.maxTokens,
        );
      }
    }
  }

  async acquire(tier: ApiTier): Promise<void> {
    this.refillBucket(tier);

    const bucket = this.buckets.get(tier);
    if (!bucket) return;

    if (bucket.tokens > 0) {
      bucket.tokens--;
      return;
    }

    return new Promise<void>((resolve, reject) => {
      this.queue.push({
        tier,
        resolve,
        reject,
        timestamp: Date.now(),
      });
      this.processQueue();
    });
  }

  private refillBucket(tier: ApiTier): void {
    const bucket = this.buckets.get(tier);
    if (!bucket) return;

    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const refill = elapsed * bucket.refillRate;

    if (refill > 0) {
      bucket.tokens = Math.min(bucket.tokens + refill, bucket.maxTokens);
      bucket.lastRefill = now;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];
      this.refillBucket(item.tier);

      const bucket = this.buckets.get(item.tier);
      if (bucket && bucket.tokens > 0) {
        this.queue.shift();
        bucket.tokens--;
        item.resolve();
      } else {
        const elapsed = Date.now() - item.timestamp;
        if (elapsed > 30000) {
          this.queue.shift();
          item.reject(new Error('Rate limit timeout: waited too long for token'));
          continue;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.processing = false;
  }

  getEndpointTier(path: string): ApiTier {
    if (path.startsWith('/v1/files/') && (
      path.endsWith('/versions') ||
      path.includes('/comments') ||
      path.includes('/variables') ||
      path.includes('/images')
    )) {
      return 2;
    }
    if (path.startsWith('/v1/teams/') ||
      path.startsWith('/v1/components/') ||
      path.startsWith('/v1/styles/') ||
      path.includes('/meta')
    ) {
      return 3;
    }
    return 1;
  }

  reset(): void {
    this.buckets.clear();
    for (const tier of [1, 2, 3] as ApiTier[]) {
      this.buckets.set(tier, this.createBucket(tier));
    }
    this.queue = [];
    this.processing = false;
  }
}
