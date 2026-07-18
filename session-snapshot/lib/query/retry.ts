/* ── Retry Manager ── */

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryOnHttpStatus?: (status: number) => boolean;
}

const defaultConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryOnHttpStatus: (s) => s >= 500 || s === 429,
};

export class RetryManager {
  private config: RetryConfig;

  constructor(config?: Partial<RetryConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  async execute<T>(fn: () => Promise<T>, attempt = 1): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      if (attempt >= this.config.maxAttempts) throw err;
      const status = err?.status ?? 0;
      if (!this.config.retryOnHttpStatus!(status) && status !== 0) throw err;
      const delay = Math.min(this.config.baseDelayMs * Math.pow(2, attempt - 1), this.config.maxDelayMs);
      await new Promise((r) => setTimeout(r, delay));
      return this.execute(fn, attempt + 1);
    }
  }

  getAttempts() { return this.config.maxAttempts; }
}

export const defaultRetry = new RetryManager();
