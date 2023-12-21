import Divider from '@components/divider/divider';
import useWalletSelector from '@hooks/useWalletSelector';
import { btcTransaction } from '@secretkeylabs/xverse-core';
import styled from 'styled-components';
import Amount from './amount';
import Bundle from './bundle';
import Inscription from './inscription';
import RareSats, { SatRange } from './rareSats';

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

const getSatRangesWithInscriptions = ({
  satributes,
  inscriptions,
  amount,
}: Omit<Props, 'onShowInscription' | 'showBottomDivider' | 'showTopDivider'>) => {
  const satRanges: {
    [offset: number]: SatRange;
  } = {};

  satributes.forEach((satribute) => {
    const { types, amount: totalSats, ...rest } = satribute;
    satRanges[rest.offset] = { ...rest, satributes: types, totalSats, inscriptions: [] };
  });

  inscriptions.forEach((inscription) => {
    const { contentType, number, ...inscriptionRest } = inscription;
    const mappedInscription = {
      ...inscriptionRest,
      content_type: contentType,
      inscription_number: number,
    };
    if (satRanges[inscription.offset]) {
      satRanges[inscription.offset] = {
        ...satRanges[inscription.offset],
        inscriptions: [...satRanges[inscription.offset].inscriptions, mappedInscription],
      };
      return;
    }

    satRanges[inscription.offset] = {
      totalSats: 1,
      offset: inscription.offset,
      fromAddress: inscription.fromAddress,
      inscriptions: [mappedInscription],
      satributes: ['COMMON'],
    };
  });

  const amountOfExoticsOrInscribedSats = Object.values(satRanges).reduce(
    (acc, range) => acc + range.totalSats,
    0,
  );

  if (amountOfExoticsOrInscribedSats < amount) {
    satRanges[-1] = {
      totalSats: amount - amountOfExoticsOrInscribedSats,
      offset: -1,
      fromAddress: '',
      inscriptions: [],
      satributes: ['COMMON'],
    };
  }

  const satRangesArray = Object.values(satRanges);
  const totalExoticSats = satRangesArray.reduce(
    (acc, curr) => acc + (!curr.satributes.includes('COMMON') ? curr.totalSats : 0),
    0,
  );

  return { satRanges: satRangesArray, totalExoticSats };
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
        <Bundle
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
