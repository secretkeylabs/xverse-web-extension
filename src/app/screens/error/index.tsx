import ErrorDisplay from '@components/errorDisplay';
import { useRouteError } from 'react-router-dom';

function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorDisplay error={error as { message: string }} />;
}

export default ErrorBoundary;
