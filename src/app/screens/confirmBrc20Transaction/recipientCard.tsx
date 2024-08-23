import FiatAmountText from '@components/fiatAmountText';
import TokenImage from '@components/tokenImage';
import useWalletSelector from '@hooks/useWalletSelector';
import { type FungibleToken } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { getTruncatedAddress } from '@utils/helper';
import { getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import AmountRow from './amountRow';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.space.m};
  background: ${(props) => props.theme.colors.elevation1};
  border-radius: ${(props) => props.theme.radius(2)}px;
  gap: ${(props) => props.theme.space.m};
`;

const RowBlock = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled(StyledP)`
  color: ${(props) => props.theme.colors.white_400};
`;

export type RecipientCardProps = {
  address: string;
  amountBrc20: BigNumber;
  amountSats: BigNumber;
  fungibleToken: FungibleToken;
};

function RecipientCard({ address, amountBrc20, amountSats, fungibleToken }: RecipientCardProps) {
  const { t } = useTranslation('translation');
  const { fiatCurrency } = useWalletSelector();

  return (
    <Container>
      <RowBlock>
        <Title typography="body_medium_m">{t('CONFIRM_TRANSACTION.TO')}</Title>
        <StyledP data-testid="address-receive" typography="body_medium_m">
          {getTruncatedAddress(address, 6)}
        </StyledP>
      </RowBlock>
      <RowBlock>
        <Title typography="body_medium_m">{t('COMMON.BUNDLE')}</Title>
        <NumericFormat
          value={Number(amountSats)}
          displayType="text"
          thousandSeparator
          prefix={`${t('COMMON.SIZE')}: `}
          suffix=" sats"
          renderText={(value) => (
            <StyledP typography="body_medium_m" color="white_400">
              {value}
            </StyledP>
          )}
        />
      </RowBlock>
      <AmountRow
        icon={<TokenImage currency="FT" loading={false} size={32} fungibleToken={fungibleToken} />}
        amountLabel={t('CONFIRM_TRANSACTION.AMOUNT')}
        amount={
          <NumericFormat
            value={Number(amountBrc20)}
            displayType="text"
            thousandSeparator
            suffix={` ${getFtTicker(fungibleToken)}`}
          />
        }
        amountSubText={
          fungibleToken?.tokenFiatRate && (
            <FiatAmountText
              fiatAmount={amountBrc20.multipliedBy(fungibleToken.tokenFiatRate)}
              fiatCurrency={fiatCurrency}
            />
          )
        }
        ticker={getFtTicker(fungibleToken)}
      />
    </Container>
  );
}
export default RecipientCard;
