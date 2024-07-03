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
