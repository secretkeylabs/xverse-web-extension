import ArrowIcon from '@assets/img/transactions/ArrowDown.svg';
import WalletIcon from '@assets/img/transactions/wallet.svg';
import { StyledFiatAmountText } from '@components/fiatAmountText';
import TokenImage from '@components/tokenImage';
import TransferDetailView from '@components/transferDetailView';
import useCoinRates from '@hooks/queries/useCoinRates';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { CubeTransparent } from '@phosphor-icons/react';
import { type FungibleToken, getFiatEquivalent } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import type { CurrencyTypes } from '@utils/constants';
import { getTicker } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: props.theme.space.m,
  paddingBottom: 20,
  marginBottom: props.theme.space.s,
}));

const RecipientTitleText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xs,
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'flex-start',
  marginTop: props.theme.space.m,
}));

const Icon = styled.img((props) => ({
  marginRight: props.theme.space.m,
  width: 32,
  height: 32,
  borderRadius: 30,
}));

const DownArrowIcon = styled.img((props) => ({
  width: 16,
  height: 16,
  marginTop: props.theme.space.xs,
  marginLeft: props.theme.space.xs,
  marginBottom: props.theme.space.xs,
}));

const TitleContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const TitleText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

const Subtitle = styled(StyledP)((props) => ({
  color: props.theme.colors.white_400,
  marginTop: props.theme.space.xxxs,
}));

const ValueText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

const SubValueText = styled.p((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.white_400,
}));

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
});

const MultipleAddressContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const TokenContainer = styled.div((props) => ({
  marginRight: props.theme.space.m,
}));

const IconContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 30,
  backgroundColor: props.theme.colors.elevation3,
  width: 32,
  height: 32,
  marginRight: props.theme.space.m,
}));

const FiatText = styled(StyledFiatAmountText)((props) => ({
  marginTop: props.theme.space.xxxs,
}));

type Props = {
  address?: string;
  value: string;
  title: string;
  currencyType: CurrencyTypes;
  valueDetail?: string;
  dataTestID?: string;
  recipientIndex?: number;
  totalRecipient?: number;
  icon?: string;
  fungibleToken?: FungibleToken;
  heading?: string;
  showSenderAddress?: boolean;
};

function RecipientComponent({
  recipientIndex,
  address,
  value,
  totalRecipient,
  valueDetail,
  dataTestID,
  title,
  fungibleToken,
  icon,
  currencyType,
  heading,
  showSenderAddress,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const [fiatAmount, setFiatAmount] = useState<string | undefined>('0');
  const { ordinalsAddress } = useSelectedAccount();
  const { fiatCurrency } = useWalletSelector();
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

  const getFtTicker = () => {
    if (fungibleToken?.ticker) {
      return fungibleToken?.ticker.toUpperCase();
    }
    if (fungibleToken?.name) {
      return getTicker(fungibleToken.name).toUpperCase();
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
      {address && (
        <div>
          {showSenderAddress ? (
            <MultipleAddressContainer>
              <TransferDetailView icon={WalletIcon} title={t('FROM')} address={ordinalsAddress} />
              <DownArrowIcon src={ArrowIcon} />
              <TransferDetailView icon={WalletIcon} title={t('TO')} address={address} />
            </MultipleAddressContainer>
          ) : (
            <TransferDetailView
              title={t('TO')}
              address={address}
              hideCopyButton
              titleColor="white_400"
            />
          )}
        </div>
      )}

      {heading && <RecipientTitleText>{heading}</RecipientTitleText>}
      {value && (
        <RowContainer>
          <TitleContainer>
            {renderIcon()}
            <div>
              <TitleText>{title}</TitleText>
              {currencyType === 'BTC' && <Subtitle typography="body_medium_s">Bitcoin</Subtitle>}
              {currencyType === 'STX' && <Subtitle typography="body_medium_s">Stacks</Subtitle>}
            </div>
          </TitleContainer>
          {currencyType === 'NFT' || currencyType === 'Ordinal' || currencyType === 'RareSat' ? (
            <ColumnContainer>
              <ValueText data-testid={dataTestID}>{value}</ValueText>
              {valueDetail && <SubValueText>{valueDetail}</SubValueText>}
            </ColumnContainer>
          ) : (
            <ColumnContainer>
              <NumericFormat
                value={Number(value)}
                displayType="text"
                thousandSeparator
                suffix={currencyType === 'FT' ? ` ${getFtTicker()} ` : ` ${currencyType}`}
                renderText={(amount) => <ValueText data-testid={dataTestID}>{amount}</ValueText>}
              />
              <FiatText fiatAmount={BigNumber(fiatAmount!)} fiatCurrency={fiatCurrency} />
            </ColumnContainer>
          )}
        </RowContainer>
      )}
    </Container>
  );
}

export default RecipientComponent;
