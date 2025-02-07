import ErrorDisplay from '@components/errorDisplay';

type Props = {
  error: unknown;
};

export function PopupPayloadError({ error }: Props) {
  // eslint-disable-next-line no-console
  console.error(error);

  return <ErrorDisplay error={{ status: 404, statusText: 'Error getting popup payload' }} />;
}
