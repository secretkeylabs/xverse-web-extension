type SuccessResult<T> = [null, T];
type ErrorResult<E = Error> = [E, null];
export type Result<T, E = Error> = SuccessResult<T> | ErrorResult<E>;

export async function safePromise<T>(promise: Promise<T>): Promise<Result<T, Error>> {
  try {
    return [null, await promise];
  } catch (error) {
    return [new Error('Safe promise rejected.', { cause: error }), null];
  }
}

export function flatResults<T>(results: Array<Result<T>>): Result<Array<T>> {
  const errors = results
    .map((r) => r[0])
    .filter((maybeError): maybeError is Error => maybeError !== null);

  if (errors.length !== 0)
    return [
      new Error(
        'Found errors in result array.',
        { cause: errors.slice(0, 10) }, // Only show first 10 errors to avoid spamming logs
      ),
      null,
    ];

  const values = results.map((r) => r[1] as T);

  return [null, values];
}

export type Option<T> = T | null;

export function safeCall<T>(fn: () => T): Result<T> {
  try {
    return [null, fn()];
  } catch (error) {
    return [new Error('Error while running safeCall.', { cause: error }), null];
  }
}
