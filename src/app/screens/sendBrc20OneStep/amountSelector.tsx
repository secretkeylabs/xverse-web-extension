import useWalletSelector from '@hooks/useWalletSelector';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { StyledP } from '@ui-library/common.styled';
import Input from '@ui-library/input';
import { type InputFeedbackProps } from '@ui-library/inputFeedback';
import { HIDDEN_BALANCE_LABEL } from '@utils/constants';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${(props) => props.theme.space.xxs};
`;

const BalanceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.space.xxxs};
`;

const Text = styled.div`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_0};
`;

const InputGroup = styled.div`
  margin-bottom: ${(props) => props.theme.space.s};
`;

const Buttons = styled.div`
  margin: ${(props) => props.theme.space.l} 0;
`;

const StyledCallout = styled(Callout)`
  margin-top: ${(props) => props.theme.space.s};
`;

type Props = {
  token: FungibleToken;
  amountToSend: string;
  onAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  amountError: InputFeedbackProps | null;
  onNext: () => void;
  processing: boolean;
  isNextEnabled: boolean;
  header?: React.ReactNode;
};

function AmountSelector({
  token,
  amountToSend,
  onAmountChange,
  amountError,
  onNext,
  processing,
  isNextEnabled,
  header,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND_BRC20' });
  const { balanceHidden } = useWalletSelector();

  return (
    <Container>
      <div>
        {header}
        <InputGroup>
          <Input
            dataTestID="amount-input"
            title={
              <RowContainer>
                <StyledP typography="body_medium_m" color="white_200">
                  {t('AMOUNT')}
                </StyledP>
                <BalanceContainer>
                  <StyledP typography="body_medium_m" color="white_200">
                    {t('BALANCE')}:
                  </StyledP>
                  <Text>
                    {balanceHidden && HIDDEN_BALANCE_LABEL}
                    {!balanceHidden && (
                      <NumericFormat
                        value={token.balance.toString()}
                        displayType="text"
                        thousandSeparator
                      />
                    )}
                  </Text>
                </BalanceContainer>
              </RowContainer>
            }
            placeholder="0"
            value={amountToSend}
            onChange={onAmountChange}
            variant={amountError?.variant === 'danger' ? 'danger' : 'default'}
            feedback={amountError ? [amountError] : undefined}
            autoFocus
          />
        </InputGroup>
        <StyledCallout bodyText={t('MAKE_SURE_THE_RECIPIENT')} />
      </div>
      <Buttons>
        <Button title={t('NEXT')} disabled={!isNextEnabled} loading={processing} onClick={onNext} />
      </Buttons>
    </Container>
  );
}

export default AmountSelector;
