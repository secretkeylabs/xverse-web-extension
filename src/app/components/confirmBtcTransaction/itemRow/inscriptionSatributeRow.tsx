import useWalletSelector from '@hooks/useWalletSelector';
import { btcTransaction } from '@secretkeylabs/xverse-core';
import Divider from '@ui-library/divider';
import styled from 'styled-components';
import { getSatRangesWithInscriptions } from '../utils';
import Amount from './amount';
import BundleTxView from './bundleTxView';
import Inscription from './inscription';
import RareSats from './rareSats';

const RowContainer = styled.div((props) => ({
  padding: `0 ${props.theme.space.m}`,
}));

type Props = {
  inscriptions: btcTransaction.IOInscription[];
  satributes: btcTransaction.IOSatribute[];
  amount: number;
  showBottomDivider?: boolean;
  showTopDivider?: boolean;
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
};

function InscriptionSatributeRow({
  inscriptions,
  satributes,
  amount,
  showBottomDivider,
  showTopDivider,
  onShowInscription,
}: Props) {
  const { hasActivatedRareSatsKey } = useWalletSelector();

  const satributesInfo = getSatRangesWithInscriptions({
    satributes,
    inscriptions,
    amount,
  });

  const getRow = () => {
    if (inscriptions.length > 0 && inscriptions.length + satributes.length > 1) {
      return (
        <BundleTxView
          inscriptions={inscriptions}
          satributesInfo={satributesInfo}
          bundleSize={amount}
          onShowInscription={onShowInscription}
          isRareSatsEnabled={hasActivatedRareSatsKey}
        />
      );
    }

    if (inscriptions.length) {
      return (
        <Inscription
          inscription={inscriptions[0]}
          bundleSize={amount}
          onShowInscription={onShowInscription}
        />
      );
    }

    // if rare sats is disabled we show the amount of btc
    if (!hasActivatedRareSatsKey) {
      return <Amount amount={amount} />;
    }

    return <RareSats satributesInfo={satributesInfo} bundleSize={amount} />;
  };

  return (
    <>
      {showTopDivider && <Divider verticalMargin="s" />}
      <RowContainer>{getRow()}</RowContainer>
      {showBottomDivider && <Divider verticalMargin="s" />}
    </>
  );
}

export default InscriptionSatributeRow;
