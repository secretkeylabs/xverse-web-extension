import ErrorDisplay from '@components/errorDisplay';

type Props = {
  error: unknown;
};

export function PopupPayloadError({ error }: Props) {
  // eslint-disable-next-line no-console
  console.error(error);

  return <ErrorDisplay error={{ message: 'Error getting popup payload' }} />;
}
