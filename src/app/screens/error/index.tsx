import ErrorDisplay from '@components/errorDisplay';
import { CoreError } from '@secretkeylabs/xverse-core';
import { isAxiosError } from 'axios';
import { useMemo } from 'react';
import { useRouteError } from 'react-router-dom';

function ErrorBoundary() {
  const error = useRouteError();

  const { status, statusText, code, message, stack } = useMemo(() => {
    if (isAxiosError(error)) {
      return {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        stack: error.stack,
      };
    }

    if (error instanceof Error) {
      if (CoreError.isCoreError(error)) {
        return {
          code: error.code,
          message: error.message,
          stack: error.stack,
        };
      }

      return {
        message: error.message,
        stack: error.stack,
      };
    }

    return {
      message: `${error}`,
    };
  }, [error]);

  return (
    <ErrorDisplay
      status={status}
      statusText={statusText}
      code={code}
      message={message}
      stack={stack}
    />
  );
}

export default ErrorBoundary;
