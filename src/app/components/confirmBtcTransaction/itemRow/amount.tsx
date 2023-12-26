import TokenImage from '@components/tokenImage';
import useWalletSelector from '@hooks/useWalletSelector';
import { currencySymbolMap, getBtcFiatEquivalent, satsToBtc } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import BigNumber from 'bignumber.js';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Avatar from './avatar';

export interface TokenImageProps {
  amount: number;
}

const RowCenter = styled.div<{ spaceBetween?: boolean }>((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: props.spaceBetween ? 'space-between' : 'initial',
}));

const NumberTypeContainer = styled.div`
  text-align: right;
`;

const AvatarContainer = styled.div`
  margin-right: ${(props) => props.theme.space.xs};
`;

export default function Amount({ amount }: TokenImageProps) {
  const { btcFiatRate, fiatCurrency } = useWalletSelector();
  const { t } = useTranslation('translation');

  const getFiatAmountString = (fiatAmount: BigNumber) => {
    if (!fiatAmount) {
      return '';
    }

    if (fiatAmount.isLessThan(0.01)) {
      return `<${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`;
    }

    return (
      <NumericFormat
        value={fiatAmount.toFixed(2).toString()}
        displayType="text"
        thousandSeparator
        prefix={`${currencySymbolMap[fiatCurrency]} `}
        suffix={` ${fiatCurrency}`}
        renderText={(value: string) => `~ ${value}`}
      />
    );
  };

  return (
    <RowCenter>
      <AvatarContainer>
        <Avatar src={<TokenImage token="BTC" loading={false} size={32} />} />
      </AvatarContainer>
      <RowCenter spaceBetween>
        <div>
          <StyledP typography="body_medium_m" color="white_200">
            {t('CONFIRM_TRANSACTION.AMOUNT')}
          </StyledP>
        </div>
        <NumberTypeContainer>
          <NumericFormat
            value={satsToBtc(new BigNumber(amount)).toFixed()}
            displayType="text"
            thousandSeparator
            suffix=" BTC"
            renderText={(value: string) => <StyledP typography="body_medium_m">{value}</StyledP>}
          />
          <StyledP typography="body_medium_s" color="white_400">
            {getFiatAmountString(
              getBtcFiatEquivalent(new BigNumber(amount), BigNumber(btcFiatRate)),
            )}
          </StyledP>
        </NumberTypeContainer>
      </RowCenter>
    </RowCenter>
  );
}
