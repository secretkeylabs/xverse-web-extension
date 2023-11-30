import { currencySymbolMap, SupportedCurrency } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Card = styled.div`
  background: ${(props) => props.theme.colors.elevation1};
  border-radius: ${(props) => props.theme.radius(2)}px;
  padding: ${(props) => props.theme.spacing(8)}px;
`;

const CardTitle = styled.div`
  margin-bottom: ${(props) => props.theme.spacing(8)}px;
`;

const TextLabel = styled.label`
  ${(props) => props.theme.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

const TextValue = styled.p`
  ${(props) => props.theme.body_medium_m}
  color: ${(props) => props.theme.colors.white_0};
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing(8)}px;
`;

const RowItem = styled.div`
  display: flex;
  justify-content: space-between;
`;

const FiatAmountText = styled.p`
  ${(props) => props.theme.body_medium_s}
  color: ${(props) => props.theme.colors.white_400};
  display: flex;
  justify-content: flex-end;
`;

function Brc20FeesComponent({
  fees,
}: {
  fees: {
    label: string;
    value: BigNumber;
    suffix: string;
    fiatValue?: BigNumber;
    fiatCurrency?: SupportedCurrency;
  }[];
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  return (
    <Card>
      <CardTitle>
        <TextLabel>{t('FEES')}</TextLabel>
      </CardTitle>
      <Rows>
        {fees.map(({ label, value, suffix, fiatValue, fiatCurrency }) => (
          <div key={label}>
            <RowItem>
              <TextLabel>{label}</TextLabel>
              <TextValue>
                <NumericFormat
                  value={value.toString()}
                  displayType="text"
                  thousandSeparator
                  suffix={` ${suffix}`}
                />
              </TextValue>
            </RowItem>
            {fiatValue && fiatCurrency && (
              <FiatAmountText>
                <NumericFormat
                  value={fiatValue.lt(0.01) ? '0.01' : fiatValue.toFixed(2).toString()}
                  displayType="text"
                  thousandSeparator
                  prefix={`${fiatValue.lt(0.01) ? '<' : '~'} ${currencySymbolMap[fiatCurrency]}`}
                  suffix={` ${fiatCurrency}`}
                />
              </FiatAmountText>
            )}
          </div>
        ))}
      </Rows>
    </Card>
  );
}

export default Brc20FeesComponent;
