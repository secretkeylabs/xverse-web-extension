import ErrorDisplay from '@components/errorDisplay';
import { useRouteError } from 'react-router-dom';

interface RouterError {
  status?: number;
  statusText?: string;
  error?: {
    message?: string;
    stack?: string;
  };
}

function ErrorBoundary() {
  const error = useRouteError() as RouterError;
  return (
    <ErrorDisplay
      error={{
        status: error.status ?? 404,
        statusText: error.statusText ?? 'Not Found',
        description: error.error?.message ?? 'An unexpected error occurred',
        stack: error.error?.stack ?? undefined,
      }}
    />
  );
}

export default ErrorBoundary;
