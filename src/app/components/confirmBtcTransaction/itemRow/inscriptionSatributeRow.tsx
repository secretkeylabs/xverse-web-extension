import Link from '@assets/img/rareSats/link.svg';
import useWalletSelector from '@hooks/useWalletSelector';
import { btcTransaction } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Divider from '@ui-library/divider';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import { getSatRangesWithInscriptions } from '../utils';
import Amount from './amount';
import Inscription from './inscription';
import RareSats from './rareSats';

const RowContainer = styled.div((props) => ({
  padding: `0 ${props.theme.space.m}`,
}));

type Props = {
  inscriptions: btcTransaction.IOInscription[];
  hasExternalInputs: boolean;
  satributes: btcTransaction.IOSatribute[];
  amount: number;
  showBottomDivider?: boolean;
  showTopDivider?: boolean;
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
};

const BundleHeader = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: props.theme.space.m,
}));

const LinkContainer = styled.div`
  display: flex;
  width: 32px;
  justify-content: center;
  margin: ${(props) => props.theme.space.xxxs} 0;
`;

function InscriptionSatributeRow({
  inscriptions,
  hasExternalInputs,
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
  const { t } = useTranslation('translation');

  // we only show rare sats if there are any and the user has enabled the feature
  const showRareSats = satributesInfo.totalExoticSats > 0 && hasActivatedRareSatsKey;

  return (
    <>
      {showTopDivider && <Divider verticalMargin="s" />}
      <RowContainer>
        {!hasExternalInputs && (
          <BundleHeader>
            <div>
              <StyledP typography="body_medium_m" color="white_400">
                {t('COMMON.BUNDLE')}
              </StyledP>
            </div>
            <div>
              {amount && (
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
              )}
            </div>
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
        {!hasActivatedRareSatsKey && <Amount amount={amount} />}
        {showRareSats && <RareSats satributesInfo={satributesInfo} />}
      </RowContainer>
      {showBottomDivider && <Divider verticalMargin="s" />}
    </>
  );
}

export default InscriptionSatributeRow;
