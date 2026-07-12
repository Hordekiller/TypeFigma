export class FigmaApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public headers?: Headers,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'FigmaApiError';
  }

  get isRateLimit(): boolean {
    return this.status === 429;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get retryAfterMs(): number | null {
    if (!this.headers) return null;
    const retryAfter = this.headers.get('Retry-After');
    if (!retryAfter) return null;
    return parseInt(retryAfter, 10) * 1000;
  }
}

export class FigmaRateLimitError extends FigmaApiError {
  public limitType: 'low' | 'high' | 'unknown';
  public limitRemaining: number;
  public limitMax: number;
  public limitReset: number;

  constructor(status: number, message: string, headers?: Headers, body?: unknown) {
    super(status, message, headers, body);
    this.name = 'FigmaRateLimitError';

    this.limitType = (headers?.get('X-Figma-Rate-Limit-Type') as 'low' | 'high') || 'unknown';
    this.limitRemaining = parseInt(headers?.get('X-Figma-Rate-Limit-Remaining') || '0', 10);
    this.limitMax = parseInt(headers?.get('X-Figma-Rate-Limit-Max') || '0', 10);
    this.limitReset = parseInt(headers?.get('X-Figma-Rate-Limit-Reset') || '0', 10);
  }

  get retryAfterSeconds(): number {
    if (this.retryAfterMs) return this.retryAfterMs / 1000;
    return this.limitReset || 60;
  }
}

export class FigmaNotFoundError extends FigmaApiError {
  constructor(message: string, headers?: Headers, body?: unknown) {
    super(404, message, headers, body);
    this.name = 'FigmaNotFoundError';
  }
}

export class FigmaForbiddenError extends FigmaApiError {
  constructor(message: string, headers?: Headers, body?: unknown) {
    super(403, message, headers, body);
    this.name = 'FigmaForbiddenError';
  }
}

export class FigmaValidationError extends FigmaApiError {
  constructor(message: string, headers?: Headers, body?: unknown) {
    super(400, message, headers, body);
    this.name = 'FigmaValidationError';
  }
}

export class FigmaServerError extends FigmaApiError {
  constructor(status: number, message: string, headers?: Headers, body?: unknown) {
    super(status, message, headers, body);
    this.name = 'FigmaServerError';
  }
}

export function createFigmaError(status: number, statusText: string, headers?: Headers, body?: unknown): FigmaApiError {
  const bodyDetail = typeof body === 'object' && body !== null
    ? ((body as Record<string, unknown>).err || (body as Record<string, unknown>).message || JSON.stringify(body))
    : undefined;
  const msg = bodyDetail ? `${statusText}: ${bodyDetail}` : statusText;

  switch (status) {
    case 429:
      return new FigmaRateLimitError(status, msg, headers, body);
    case 404:
      return new FigmaNotFoundError(msg, headers, body);
    case 403:
      return new FigmaForbiddenError(msg, headers, body);
    case 400:
      return new FigmaValidationError(msg, headers, body);
    default:
      if (status >= 500) {
        return new FigmaServerError(status, msg, headers, body);
      }
      return new FigmaApiError(status, msg, headers, body);
  }
}
