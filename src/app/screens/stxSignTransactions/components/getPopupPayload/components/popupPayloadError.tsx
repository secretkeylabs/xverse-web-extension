import ErrorDisplay from '@components/errorDisplay';

type Props = {
  error: unknown;
};

export function PopupPayloadError({ error }: Props) {
  // eslint-disable-next-line no-console
  console.error(error);

  let message = `Error getting popup payload: ${error}`;
  let stack = '';
  if (error && typeof error === 'object') {
    if ('message' in error) {
      message = `Error getting popup payload: ${error.message}`;
    }
    if ('stack' in error) {
      stack = `${error.stack}`;
    }
  }

  return <ErrorDisplay message={message} stack={stack} />;
}
