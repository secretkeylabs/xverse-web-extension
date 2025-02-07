/* eslint-disable @typescript-eslint/no-shadow */

// NOTE: The above rule is disabled due to the currently used version not
// detecting modern Typescript syntax.

/**
 * @public
 */
export type SafeError<TName extends string = string, TData = unknown> = {
  readonly name: TName;
  readonly message: string;
  readonly data?: TData;
};

type SuccessResult<Data = unknown> = [null, Data];
type ErrorResult<Error extends SafeError = SafeError> = [Error, null];
export type Result<Data = unknown, Error extends SafeError = SafeError> =
  | SuccessResult<Data>
  | ErrorResult<Error>;

/**
 * @deprecated Use `success` from `xverse-core` instead.
 * @public
 */
export function success<Data>(data: Data): Result<Data, never> {
  return [null, data];
}

/**
 * @deprecated Use `error` from `xverse-core` instead.
 * @public
 */
export function error<const E extends SafeError>(error: E): Result<never, E> {
  return [error, null];
}

/**
 * @deprecated Use `safePromise` from `xverse-core` instead.
 */
export async function safePromise<T>(
  promise: Promise<T>,
): Promise<Result<T, SafeError<'SafeError'>>> {
  try {
    return success(await promise);
  } catch (e) {
    return error({ name: 'SafeError', message: 'Promise rejected.', data: e });
  }
}
