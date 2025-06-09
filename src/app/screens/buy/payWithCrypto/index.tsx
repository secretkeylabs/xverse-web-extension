import Divider from '@ui-library/divider';

import CurrencyEthIcon from '@assets/img/CurrencyEth.svg';
import EthSwapIcon from '@assets/img/EthSwap.svg';
import SolSwapIcon from '@assets/img/SolSwap.svg';

import TokenImage from '@components/tokenImage';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import { getFiatEquivalent, microstacksToStx } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import {
  Chip,
  CryptoSheetSelectItem,
  CryptoSheetSelectItemValues,
  PaymentMethodImg,
  SheetSelect,
  SheetSelectItem,
} from '../index.styled';
import {
  AltOptText,
  Container,
  CryptoSheetStacksRow,
  DividerContainer,
  SheetContainer,
  SheetItem,
  StxCryptoSheetItem,
  StyledFiatText,
} from './index.styled';

function PayWithCrypto() {
  const { t } = useTranslation('translation', { keyPrefix: 'BUY_SCREEN' });
  const stxWalletData = useStxWalletData();
  const { btcFiatRate, stxBtcRate } = useSupportedCoinRates();

  const [openPayWithCryptoSheet, setOpenPayWithCryptoSheet] = useState(false);

  const redirectToSwapApp = () => {
    window.open('https://wallet.xverse.app/swap', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Container>
        <DividerContainer>
          <Divider $verticalMargin="l" color="elevation6" />
        </DividerContainer>
        <SheetContainer>
          <AltOptText>{t('PAY_WITH_CRYPTO.ALT_OPTION')}</AltOptText>
          <SheetSelectItem onClick={() => setOpenPayWithCryptoSheet(true)}>
            <CryptoSheetSelectItem>
              <PaymentMethodImg src={CurrencyEthIcon} />
              <SheetItem>
                <span>{t('PAY_WITH_CRYPTO.TITLE')}</span>
                <Chip>{t('PAY_WITH_CRYPTO.NEW_CHIP')}</Chip>
              </SheetItem>
            </CryptoSheetSelectItem>
          </SheetSelectItem>
        </SheetContainer>
      </Container>
      <SheetSelect
        title={t('PAYMENT_METHOD')}
        visible={openPayWithCryptoSheet}
        onClose={() => setOpenPayWithCryptoSheet(false)}
      >
        <ul>
          <SheetSelectItem onClick={redirectToSwapApp}>
            <CryptoSheetSelectItem>
              <TokenImage currency="STX" />
              <CryptoSheetStacksRow>
                <CryptoSheetSelectItemValues>
                  <span>{t('PAY_WITH_CRYPTO.STACKS')}</span>
                  <span>{t('PAY_WITH_CRYPTO.STX')}</span>
                </CryptoSheetSelectItemValues>
                {stxWalletData.data && stxWalletData.data.balance && (
                  <StxCryptoSheetItem>
                    <span>
                      <NumericFormat
                        value={microstacksToStx(
                          new BigNumber(stxWalletData.data.balance),
                        ).toString()}
                        displayType="text"
                        thousandSeparator
                      />
                    </span>
                    <span>
                      <StyledFiatText
                        fiatCurrency="USD"
                        fiatAmount={BigNumber(
                          getFiatEquivalent(
                            microstacksToStx(BigNumber(stxWalletData.data.balance)).toNumber(),
                            'STX',
                            BigNumber(stxBtcRate),
                            BigNumber(btcFiatRate),
                          )!,
                        )}
                      />
                    </span>
                  </StxCryptoSheetItem>
                )}
              </CryptoSheetStacksRow>
            </CryptoSheetSelectItem>
          </SheetSelectItem>
          <SheetSelectItem onClick={redirectToSwapApp}>
            <CryptoSheetSelectItem>
              <TokenImage imageUrl={EthSwapIcon} />
              <CryptoSheetSelectItemValues>
                <span>{t('PAY_WITH_CRYPTO.ETHEREUM')}</span>
                <span>{t('PAY_WITH_CRYPTO.ETH')}</span>
              </CryptoSheetSelectItemValues>
            </CryptoSheetSelectItem>
          </SheetSelectItem>
          <SheetSelectItem onClick={redirectToSwapApp}>
            <CryptoSheetSelectItem>
              <TokenImage imageUrl={SolSwapIcon} />
              <CryptoSheetSelectItemValues>
                <span>{t('PAY_WITH_CRYPTO.SOLANA')}</span>
                <span>{t('PAY_WITH_CRYPTO.SOL')}</span>
              </CryptoSheetSelectItemValues>
            </CryptoSheetSelectItem>
          </SheetSelectItem>
        </ul>
      </SheetSelect>
    </>
  );
}

export default PayWithCrypto;
