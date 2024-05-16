import ArrowIcon from '@assets/img/transactions/ArrowDown.svg';
import OutputIcon from '@assets/img/transactions/output.svg';
import WalletIcon from '@assets/img/transactions/wallet.svg';
import TokenImage from '@components/tokenImage';
import TransferDetailView from '@components/transferDetailView';
import useCoinRates from '@hooks/queries/useCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { CubeTransparent } from '@phosphor-icons/react';
import { currencySymbolMap, FungibleToken, getFiatEquivalent } from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';
import { getTicker } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

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
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xs,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'flex-start',
  marginBottom: 12,
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
  color: props.theme.colors.white_200,
  textAlign: 'center',
  marginTop: 5,
}));

const ValueText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
}));

const SubValueText = styled.p((props) => ({
  ...props.theme.body_m,
  fontSize: 12,
  color: props.theme.colors.white_400,
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

const IconContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 30,
  backgroundColor: props.theme.colors.elevation3,
  width: 32,
  height: 32,
  marginRight: props.theme.spacing(4),
}));

interface Props {
  address?: string;
  value: string;
  title: string;
  currencyType: CurrencyTypes;
  valueDetail?: string;
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
  valueDetail,
  title,
  fungibleToken,
  icon,
  currencyType,
  heading,
  showSenderAddress,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const [fiatAmount, setFiatAmount] = useState<string | undefined>('0');
  const { fiatCurrency, ordinalsAddress } = useWalletSelector();
  const { btcFiatRate, stxBtcRate } = useCoinRates();

  useEffect(() => {
    setFiatAmount(
      getFiatEquivalent(
        Number(value),
        currencyType,
        BigNumber(stxBtcRate),
        BigNumber(btcFiatRate),
        fungibleToken,
      ),
    );
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

  const getFiatAmountString = (amount: BigNumber) => {
    if (amount) {
      if (amount.isLessThan(0.01)) {
        return `<${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`;
      }
      return (
        <NumericFormat
          value={amount.toFixed(2).toString()}
          displayType="text"
          thousandSeparator
          prefix={`~ ${currencySymbolMap[fiatCurrency]} `}
          suffix={` ${fiatCurrency}`}
        />
      );
    }
    return '';
  };

  const renderIcon = () => {
    if (currencyType === 'RareSat') {
      return (
        <IconContainer>
          <CubeTransparent size="16" weight="regular" />
        </IconContainer>
      );
    }

    if (icon) {
      return <Icon src={icon} />;
    }

    return (
      <TokenContainer>
        <TokenImage
          currency={currencyType}
          loading={false}
          size={32}
          fungibleToken={fungibleToken}
        />
      </TokenContainer>
    );
  };

  return (
    <Container>
      {recipientIndex && totalRecipient && totalRecipient !== 1 && (
        <RecipientTitleText>
          {`${t('RECIPIENT')} ${recipientIndex}/${totalRecipient}`}
        </RecipientTitleText>
      )}
      {heading && <RecipientTitleText>{heading}</RecipientTitleText>}
      {value && (
        <RowContainer>
          {renderIcon()}
          <TitleText>{title}</TitleText>
          {currencyType === 'NFT' || currencyType === 'Ordinal' || currencyType === 'RareSat' ? (
            <ColumnContainer>
              <ValueText>{value}</ValueText>
              {valueDetail && <SubValueText>{valueDetail}</SubValueText>}
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
      )}
      {address && (
        <div>
          {showSenderAddress ? (
            <MultipleAddressContainer>
              <TransferDetailView icon={WalletIcon} title={t('FROM')} address={ordinalsAddress} />
              <DownArrowIcon src={ArrowIcon} />
              <TransferDetailView icon={WalletIcon} title={t('To')} address={address} />
            </MultipleAddressContainer>
          ) : (
            <TransferDetailView icon={OutputIcon} title={t('RECIPIENT')} address={address} />
          )}
        </div>
      )}
    </Container>
  );
}

export default RecipientComponent;
