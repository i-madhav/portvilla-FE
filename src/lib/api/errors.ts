/**
 * One error type for every failure mode the transport can produce.
 *
 * Previously a failed call surfaced as one of three different shapes depending
 * on which helper you happened to hit: `ApiError` from ApiClient, a bare
 * `Error` from sessionApi/waitlistApi, and an `Error` with a bolted-on `status`
 * from the multipart upload helper. Callers could not branch on status
 * uniformly, so most of them just showed a generic message.
 */

/**
 * Why a request failed.
 *
 * `http` means the server answered and said no. Everything else means we never
 * got a usable answer — which matters, because only the latter are safe to
 * retry blindly.
 */
export type ApiErrorKind =
  | 'http'
  | 'network'
  | 'timeout'
  | 'canceled'
  | 'parse';

export class ApiError extends Error {
  readonly name = 'ApiError';
  /** HTTP status, or 0 when the request never completed. */
  readonly status: number;
  readonly kind: ApiErrorKind;
  /** Parsed response body, when the server sent one and it was JSON. */
  readonly body: unknown;

  constructor(
    status: number,
    message: string,
    options: { kind?: ApiErrorKind; body?: unknown; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.status = status;
    this.kind = options.kind ?? (status > 0 ? 'http' : 'network');
    this.body = options.body;
  }

  /** True for 5xx and the transient transport failures worth another attempt. */
  get isTransient(): boolean {
    if (this.kind === 'network' || this.kind === 'timeout') return true;
    return this.status === 429 || (this.status >= 500 && this.status <= 599);
  }

  /** The session is gone or was never valid. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  static network(cause: unknown): ApiError {
    return new ApiError(0, 'Network request failed. Check your connection.', {
      kind: 'network',
      cause,
    });
  }

  static timeout(ms: number): ApiError {
    return new ApiError(0, `Request timed out after ${Math.round(ms / 1000)}s.`, {
      kind: 'timeout',
    });
  }

  static canceled(): ApiError {
    return new ApiError(0, 'Request canceled.', { kind: 'canceled' });
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

/**
 * A canceled request is not a failure — it means the caller moved on (component
 * unmounted, query superseded). Callers use this to skip error toasts.
 */
export function isCanceled(e: unknown): boolean {
  return isApiError(e) && e.kind === 'canceled';
}
