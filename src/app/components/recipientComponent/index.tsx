import TransferDetailView from '@components/transferDetailView';
import OutputIcon from '@assets/img/transactions/output.svg';
import ArrowIcon from '@assets/img/transactions/ArrowDown.svg';
import WalletIcon from '@assets/img/transactions/wallet.svg';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import { FungibleToken, getFiatEquivalent } from '@secretkeylabs/xverse-core';
import TokenImage from '@components/tokenImage';
import { CurrencyTypes } from '@utils/constants';
import useWalletSelector from '@hooks/useWalletSelector';
import { useEffect, useState } from 'react';
import { getTicker } from '@utils/helper';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: '16px 16px',
  justifyContent: 'center',
  marginBottom: 12,
}));

const RecipientTitleText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
  marginBottom: 16,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'flex-start',
});

const AddressContainer = styled.div({
  marginTop: 12,
});

const Icon = styled.img((props) => ({
  marginRight: props.theme.spacing(4),
  width: 32,
  height: 32,
  borderRadius: 30,
}));

const DownArrowIcon = styled.img((props) => ({
  width: 16,
  height: 16,
  marginTop: props.theme.spacing(4),
  marginLeft: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
}));

const TitleText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
  textAlign: 'center',
  marginTop: 5,
}));

const ValueText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

const SubValueText = styled.p((props) => ({
  ...props.theme.body_m,
  fontSize: 12,
  color: props.theme.colors.white[400],
}));

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  paddingTop: 5,
});

const MultipleAddressContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const TokenContainer = styled.div({
  marginRight: 10,
});

interface Props {
  address?: string;
  value: string;
  title: string;
  currencyType: CurrencyTypes;
  recipientIndex?: number;
  totalRecipient?: number;
  icon?: string;
  fungibleToken?: FungibleToken;
  heading?: string;
  showSenderAddress?: boolean;
}
function RecipientComponent({
  recipientIndex,
  address,
  value,
  totalRecipient,
  title,
  fungibleToken,
  icon,
  currencyType,
  heading,
  showSenderAddress,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const [fiatAmount, setFiatAmount] = useState<string | undefined>('0');
  const { stxBtcRate, btcFiatRate, fiatCurrency, ordinalsAddress } = useWalletSelector();

  useEffect(() => {
    let amountInCurrency;
    if (currencyType === 'FT') {
      amountInCurrency = new BigNumber(value).multipliedBy(fungibleToken?.tokenFiatRate!);
      if (amountInCurrency.isLessThan(0.01)) {
        amountInCurrency = '0.01';
      }
    } else {
      amountInCurrency = getFiatEquivalent(
        Number(value),
        currencyType,
        stxBtcRate,
        btcFiatRate,
        fungibleToken,
      );
    }
    setFiatAmount(amountInCurrency);
  }, [value]);

  function getFtTicker() {
    if (fungibleToken?.ticker) {
      return fungibleToken?.ticker.toUpperCase();
    }
    if (fungibleToken?.name) {
      return getTicker(fungibleToken.name).toUpperCase();
    }
    return '';
  }

  const getFiatAmountString = (fiatAmount: BigNumber) => {
    if (fiatAmount) {
      if (fiatAmount.isLessThan(0.01)) {
        return `<${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`;
      }
      return (
        <NumericFormat
          value={fiatAmount.toFixed(2).toString()}
          displayType="text"
          thousandSeparator
          prefix={`~ ${currencySymbolMap[fiatCurrency]} `}
          suffix={` ${fiatCurrency}`}
        />
      );
    }
    return '';
  };

  return (
    <Container>
      {recipientIndex && totalRecipient && totalRecipient !== 1 && (
        <RecipientTitleText>
          {`${t('RECIPIENT')} ${recipientIndex}/${totalRecipient}`}
        </RecipientTitleText>
      )}
      {heading && <RecipientTitleText>{heading}</RecipientTitleText>}
      <RowContainer>
        {icon ? (
          <Icon src={icon} />
        ) : (
          <TokenContainer>
            <TokenImage
              token={currencyType}
              loading={false}
              size={32}
              fungibleToken={fungibleToken}
            />
          </TokenContainer>
        )}
        <TitleText>{title}</TitleText>
        {currencyType === 'NFT' || currencyType === 'Ordinal' ? (
          <ColumnContainer>
            <ValueText>{value}</ValueText>
          </ColumnContainer>
        ) : (
          <ColumnContainer>
            <NumericFormat
              value={Number(value)}
              displayType="text"
              thousandSeparator
              suffix={currencyType === 'FT' ? ` ${getFtTicker()} ` : ` ${currencyType}`}
              renderText={(amount) => <ValueText>{amount}</ValueText>}
            />
            <SubValueText>{getFiatAmountString(new BigNumber(fiatAmount!))}</SubValueText>
          </ColumnContainer>
        )}
      </RowContainer>
      {address && (
        <AddressContainer>
          {showSenderAddress ? (
            <MultipleAddressContainer>
              <TransferDetailView icon={WalletIcon} title={t('FROM')} address={ordinalsAddress} />
              <DownArrowIcon src={ArrowIcon} />
              <TransferDetailView icon={WalletIcon} title={t('To')} address={address} />
            </MultipleAddressContainer>
          ) : (
            <TransferDetailView icon={OutputIcon} title={t('RECIPIENT')} address={address} />
          )}
        </AddressContainer>
      )}
    </Container>
  );
}

export default RecipientComponent;
