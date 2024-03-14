import useWalletSelector from './useWalletSelector';

type FeatureId = 'RUNES_SUPPORT';

export default function useHasFeature(feature: FeatureId): boolean {
  const { network } = useWalletSelector();

  switch (feature) {
    case 'RUNES_SUPPORT':
      return network?.type === 'Testnet';
    default:
      return false;
  }
}
