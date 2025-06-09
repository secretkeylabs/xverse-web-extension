import {
  currencySymbolMap,
  type Protocol,
  type SupportedCurrency,
} from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { MaxButton } from '@ui-library/input';
import BigNumber from 'bignumber.js';
import { useRef, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div<{ $hasError: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.elevation_n1};
  cursor: pointer;
  margin: ${(props) => props.theme.space.xs} 0;
  padding: ${(props) => props.theme.space.m};
  border: 1px solid
    ${(props) =>
      props.$hasError ? props.theme.colors.danger_dark_200 : props.theme.colors.white_800};
  border-radius: ${(props) => props.theme.space.s};
  &:focus-within {
    border-color: ${(props) =>
      props.$hasError ? props.theme.colors.danger_dark_200 : props.theme.colors.white_600};
  }
`;

const InputField = styled.input<{ $hasError: boolean }>`
  ${(props) => props.theme.typography.body_medium_l}
  background-color: transparent;
  border: none;
  width: 100%;
  margin-bottom: ${(props) => props.theme.space.xxs};
  color: ${(props) =>
    props.$hasError ? props.theme.colors.danger_light : props.theme.colors.white_0};
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

const ConvertedFiatP = styled(StyledP)`
  word-break: break-word;
`;

const BalanceP = styled(StyledP)`
  word-break: break-word;
  text-align: right;
  flex: 1;
  margin-right: ${(props) => props.theme.space.xs};
`;

type Props = {
  input: {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    fiatValue: string;
    fiatCurrency: SupportedCurrency;
    protocol?: Protocol;
    decimals?: number;
    unit?: string;
  };
  balance?: string;
  max?: {
    isDisabled: boolean;
    onClick: () => void;
  };
};

const getValidatorByProtocol = (protocol?: Protocol, ftDecimals?: number) => {
  const validatorByProtocol: Record<Protocol, RegExp> = {
    btc: /^(?:[0-9]+(?:\.[0-9]{0,8})?)?$/,
    stx: /^(?:[0-9]+(?:\.[0-9]{0,6})?)?$/,
    sip10: new RegExp(`^(?:[0-9]+(?:\\${ftDecimals === 0 ? '' : '.'}[0-9]{0,${ftDecimals}})?)?$`),
    brc20: new RegExp(`^(?:[0-9]+(?:\\${ftDecimals === 0 ? '' : '.'}[0-9]{0,${ftDecimals}})?)?$`),
    runes: new RegExp(`^(?:[0-9]+(?:\\${ftDecimals === 0 ? '' : '.'}[0-9]{0,${ftDecimals}})?)?$`),
  };

  return protocol ? validatorByProtocol[protocol] : /^[0-9.]*$/;
};

export default function AmountInput({ max, input, balance }: Props) {
  const { t } = useTranslation('translation');
  const inputRef = useRef<HTMLInputElement>(null);

  const tokenInputValidator = getValidatorByProtocol(input.protocol, Number(input.decimals));

  const handleClick = () => {
    inputRef.current?.focus();
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (tokenInputValidator.test(value)) {
      input.onChange(value);
    }
  };

  const error = Boolean(balance && new BigNumber(input.value).isGreaterThan(balance));

  return (
    <div>
      <StyledP typography="body_medium_m" color="white_400">
        {t('SWAP_CONFIRM_SCREEN.AMOUNT')}{' '}
        {`${input.unit ? `${t('COMMON.IN').toLowerCase()} ${input.unit}` : ''}`}
      </StyledP>
      <Container onClick={handleClick} $hasError={error}>
        <InputField
          data-testid="swap-amount"
          ref={inputRef}
          value={input.value}
          onChange={handleOnChange}
          placeholder={input.placeholder ?? '0'}
          $hasError={error}
        />
        <NumericFormat
          value={input.fiatValue}
          displayType="text"
          thousandSeparator
          prefix={`~${currencySymbolMap[input.fiatCurrency]}`}
          suffix={` ${input.fiatCurrency}`}
          renderText={(value: string) => (
            <ConvertedFiatP data-testid="usd-text" typography="body_s" color="white_400">
              {value || '--'}
            </ConvertedFiatP>
          )}
        />
      </Container>
      <RowCenter justifyContent="space-between">
        <RowCenter justifyContent="flex-start">
          <StyledP typography="body_medium_m" color="white_400">
            {t('SWAP_SCREEN.BALANCE')}:&nbsp;
          </StyledP>
          <NumericFormat
            value={balance}
            displayType="text"
            thousandSeparator
            renderText={(value: string) => (
              <BalanceP data-testid="swap-token-balance" typography="body_medium_m" color="white_0">
                {value || '--'}
              </BalanceP>
            )}
          />
        </RowCenter>
        {max && (
          <MaxButton
            disabled={max.isDisabled || new BigNumber(balance ?? 0).eq(0)}
            onClick={max.onClick}
          >
            {t('SEND.MAX')}
          </MaxButton>
        )}
      </RowCenter>
    </div>
  );
}
