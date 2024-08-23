import Link from '@assets/img/rareSats/link.svg';
import useWalletSelector from '@hooks/useWalletSelector';
import { btcTransaction } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import { getSatRangesWithInscriptions } from '../utils';
import Inscription from './inscription';
import RareSats from './rareSats';

const Container = styled.div`
  margin-bottom: ${(props) => props.theme.space.s};
`;

const LinkContainer = styled.div`
  display: flex;
  width: 32px;
  justify-content: center;
  margin-top: ${(props) => props.theme.space.xxxs};
  margin-bottom: -6px;
`;

const BundleHeader = styled.div<{ topMargin? }>((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: props.theme.space.s,
  marginTop: props.topMargin ? props.theme.space.s : 0,
}));

type Props = {
  inscriptions: btcTransaction.IOInscription[];
  satributes: btcTransaction.IOSatribute[];
  amount: number;
  showAmount?: boolean;
  topMargin?: boolean;
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
};

function InscriptionSatributeRow({
  inscriptions,
  satributes,
  amount,
  showAmount = false,
  topMargin = false,
  onShowInscription,
}: Props) {
  const { t } = useTranslation('translation');
  const { hasActivatedRareSatsKey } = useWalletSelector();
  const satributesInfo = getSatRangesWithInscriptions({
    satributes,
    inscriptions,
    amount,
  });
  // we only show rare sats if there are any and the user has enabled the feature
  const showRareSats = satributesInfo.totalExoticSats > 0 && hasActivatedRareSatsKey;

  return (
    <Container>
      {showAmount && (
        <BundleHeader topMargin={topMargin}>
          <StyledP typography="body_medium_m" color="white_400">
            {t('COMMON.BUNDLE')}
          </StyledP>
          <NumericFormat
            value={amount}
            displayType="text"
            thousandSeparator
            prefix={`${t('COMMON.SIZE')}: `}
            suffix={` ${t('COMMON.SATS')}`}
            renderText={(value: string) => (
              <StyledP typography="body_medium_m" color="white_400">
                {value}
              </StyledP>
            )}
          />
        </BundleHeader>
      )}
      {inscriptions.map((inscription, index) => (
        <div key={inscription.number}>
          <Inscription inscription={inscription} onShowInscription={onShowInscription} />
          {!!(inscriptions.length > index + 1 || showRareSats) && (
            <LinkContainer>
              <img src={Link} alt="link" />
            </LinkContainer>
          )}
        </div>
      ))}
      {showRareSats && <RareSats satributesInfo={satributesInfo} />}
    </Container>
  );
}

export default InscriptionSatributeRow;
