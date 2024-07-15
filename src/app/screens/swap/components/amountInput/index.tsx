import useWalletSelector from '@hooks/useWalletSelector';
import { currencySymbolMap, SupportedCurrency } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { MaxButton } from '@ui-library/input';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.elevation_n1};
  cursor: pointer;
  margin: ${(props) => props.theme.space.xs} 0;
  padding: ${(props) => props.theme.space.m};
  border: 1px solid ${(props) => props.theme.colors.white_800};
  border-radius: ${(props) => props.theme.space.s};
  &:focus-within {
    border-color: ${(props) => props.theme.colors.white_600};
  }
`;

const InputField = styled.input<{ $bgColor?: string }>`
  ${(props) => props.theme.typography.body_medium_l}
  background-color: transparent;
  border: none;
  width: 100%;
  margin-bottom: ${(props) => props.theme.space.xxs};
  color: ${(props) => props.theme.colors.white_0};
  caret-color: ${(props) => props.theme.colors.tangerine};
  ::selection {
    background-color: ${(props) => props.theme.colors.tangerine};
    color: ${(props) => props.theme.colors.elevation0};
  }
  ::placeholder {
    color: ${(props) => props.theme.colors.white_400};
  }
`;

const RowCenter = styled.div<{ justifyContent: 'space-between' | 'flex-start' }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${(props) => props.justifyContent};
`;

const BalanceP = styled(StyledP)`
  word-break: break-word;
  text-align: right;
  flex: 1;
  margin-right: ${(props) => props.theme.space.xs};
`;

type Props = {
  label: string;
  input: {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    fiatValue: string;
    fiatCurrency: SupportedCurrency;
  };
  balance: string;
  max?: {
    isDisabled: boolean;
    onClick: () => void;
  };
};

export default function AmountInput({ label, max, input, balance }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <StyledP typography="body_medium_m" color="white_400">
        {label}
      </StyledP>
      <Container onClick={handleClick}>
        <InputField
          ref={inputRef}
          value={input.value}
          onChange={(e) => input.onChange(e.target.value)}
          placeholder={input.placeholder ?? '0'}
        />
        <NumericFormat
          value={input.fiatValue}
          displayType="text"
          thousandSeparator
          prefix={`~${currencySymbolMap[input.fiatCurrency]}`}
          renderText={(value: string) => (
            <StyledP typography="body_s" color="white_400">
              {value} {input.fiatCurrency}
            </StyledP>
          )}
        />
      </Container>
      <RowCenter justifyContent="space-between">
        <RowCenter justifyContent="flex-start">
          <StyledP typography="body_medium_m" color="white_400">
            {t('BALANCE')}:&nbsp;
          </StyledP>
          <NumericFormat
            value={balance}
            displayType="text"
            thousandSeparator
            renderText={(value: string) => (
              <BalanceP typography="body_medium_m" color="white_0">
                {value ?? '--'}
              </BalanceP>
            )}
          />
        </RowCenter>
        <MaxButton disabled={max?.isDisabled} onClick={max?.onClick}>
          MAX
        </MaxButton>
      </RowCenter>
    </div>
  );
}
