import Link from '@assets/img/rareSats/link.svg';
import { btcTransaction } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import { SatRangeTx } from '../utils';
import Inscription from './inscription';
import RareSats from './rareSats';

type Props = {
  inscriptions: btcTransaction.IOInscription[];
  satributesInfo: { satRanges: SatRangeTx[]; totalExoticSats: number };
  bundleSize: number;
  isRareSatsEnabled?: boolean;
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
};

const Header = styled.div((props) => ({
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

export default function BundleTxView({
  inscriptions,
  satributesInfo,
  bundleSize,
  isRareSatsEnabled,
  onShowInscription,
}: Props) {
  const { t } = useTranslation('translation');

  // we only show rare sats if there are any and the user has enabled the feature
  const showRareSats = satributesInfo.totalExoticSats > 0 && isRareSatsEnabled;

  return (
    <>
      <Header>
        <div>
          <StyledP typography="body_medium_m" color="white_400">
            {t('COMMON.BUNDLE')}
          </StyledP>
        </div>
        <div>
          {bundleSize && (
            <NumericFormat
              value={bundleSize}
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
      </Header>
      <div>
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
      </div>
    </>
  );
}
