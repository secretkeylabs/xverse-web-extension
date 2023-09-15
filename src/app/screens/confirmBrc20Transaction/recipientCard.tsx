import BigNumber from 'bignumber.js';
import OutputIcon from '@assets/img/transactions/output.svg';
import btcIcon from '@assets/img/ledger/btc_icon.svg';
import TokenImage from '@components/tokenImage';
import TransferDetailView from '@components/transferDetailView';
import styled from 'styled-components';
import useWalletSelector from '@hooks/useWalletSelector';
import { FungibleToken, getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';
import { NumericFormat } from 'react-number-format';
import { getFtTicker } from '@utils/tokens';
import { useTranslation } from 'react-i18next';
import { FiatAmountText } from '@components/fiatAmountText';
import AmountRow from './amountRow';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing(8)}px;
  background: ${(props) => props.theme.colors.elevation1};
  border-radius: ${(props) => props.theme.radius(2)}px;
  gap: ${(props) => props.theme.spacing(8)}px;
`;

function RecipientCard({
  address,
  amountBrc20,
  amountSats,
  fungibleToken,
}: {
  address: string;
  amountBrc20: BigNumber;
  amountSats: BigNumber;
  fungibleToken: FungibleToken;
}) {
  const { t } = useTranslation('translation');
  const { btcFiatRate, fiatCurrency } = useWalletSelector();

  return (
    <Container>
      <AmountRow
        icon={<TokenImage token="FT" loading={false} size={32} fungibleToken={fungibleToken} />}
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
            fiatAmount={getBtcFiatEquivalent(amountSats, btcFiatRate)}
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
