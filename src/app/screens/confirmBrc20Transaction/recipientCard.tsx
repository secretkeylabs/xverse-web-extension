import btcIcon from '@assets/img/ledger/btc_icon.svg';
import OutputIcon from '@assets/img/transactions/output.svg';
import FiatAmountText from '@components/fiatAmountText';
import TokenImage from '@components/tokenImage';
import TransferDetailView from '@components/transferDetailView';
import useCoinRates from '@hooks/queries/useCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { getBtcFiatEquivalent, type FungibleToken } from '@secretkeylabs/xverse-core';
import { getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import AmountRow from './amountRow';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing(8)}px;
  background: ${(props) => props.theme.colors.elevation1};
  border-radius: ${(props) => props.theme.radius(2)}px;
  gap: ${(props) => props.theme.spacing(8)}px;
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
  const { btcFiatRate } = useCoinRates();

  return (
    <Container>
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
      />
      <AmountRow
        icon={<img src={btcIcon} width={32} height={32} alt="bitcoin" />}
        amountLabel={t('CONFIRM_TRANSACTION.AMOUNT')}
        amount={
          <NumericFormat
            value={Number(amountSats)}
            displayType="text"
            thousandSeparator
            suffix={` sats`}
          />
        }
        amountSubText={
          <FiatAmountText
            fiatAmount={getBtcFiatEquivalent(amountSats, BigNumber(btcFiatRate))}
            fiatCurrency={fiatCurrency}
          />
        }
      />
      <TransferDetailView
        icon={OutputIcon}
        title={t('CONFIRM_TRANSACTION.RECIPIENT')}
        address={address}
      />
    </Container>
  );
}
export default RecipientCard;
