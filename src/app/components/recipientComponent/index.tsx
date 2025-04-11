import ArrowIcon from '@assets/img/transactions/ArrowDown.svg';
import WalletIcon from '@assets/img/transactions/wallet.svg';
import TokenImage from '@components/tokenImage';
import TransferDetailView from '@components/transferDetailView';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { CubeTransparent } from '@phosphor-icons/react';
import { type FungibleToken, getFiatEquivalent } from '@secretkeylabs/xverse-core';
import type { CurrencyTypes } from '@utils/constants';
import { getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import {
  ColumnContainer,
  Container,
  DownArrowIcon,
  FiatText,
  Icon,
  IconContainer,
  MultipleAddressContainer,
  RecipientTitleText,
  RowContainer,
  SubValueText,
  Subtitle,
  Title,
  TitleContainer,
  TitleText,
  TokenContainer,
  ValueText,
} from './index.styled';

type Props = {
  address?: string;
  value: string;
  title: string;
  currencyType: CurrencyTypes;
  valueDetail?: string;
  dataTestID?: string;
  icon?: string;
  fungibleToken?: FungibleToken;
  heading?: string;
  showSenderAddress?: boolean;
};

function RecipientComponent({
  address,
  value,
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
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();

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
    <>
      <Title>{t('YOU_WILL_SEND')}</Title>
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
                  suffix={
                    currencyType === 'FT' && fungibleToken
                      ? ` ${getFtTicker(fungibleToken).toUpperCase()} `
                      : ` ${currencyType}`
                  }
                  renderText={(amount) => <ValueText data-testid={dataTestID}>{amount}</ValueText>}
                />
                <FiatText fiatAmount={BigNumber(fiatAmount!)} fiatCurrency={fiatCurrency} />
              </ColumnContainer>
            )}
          </RowContainer>
        )}
      </Container>
    </>
  );
}

export default RecipientComponent;
