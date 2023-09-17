import ActionButton from '@components/button';
import TokenImage from '@components/tokenImage';
import { FungibleToken } from '@secretkeylabs/xverse-core';
import Callout from '@ui-library/callout';
import { InputFeedback, InputFeedbackProps, isDangerFeedback } from '@ui-library/inputFeedback';
import { getFtTicker } from '@utils/tokens';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  justifyContent: 'space-between',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const BRC20TokenTagContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: props.theme.spacing(3),
}));

const BRC20TokenTag = styled.div((props) => ({
  background: props.theme.colors.white[400],
  borderRadius: 40,
  width: 54,
  height: 19,
  padding: '2px 6px',
  h1: {
    ...props.theme.body_bold_l,
    fontSize: 11,
    color: props.theme.colors.background.elevation0,
  },
}));

const TokenContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(16),
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const AmountInputContainer = styled.div<{ error: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  border: props.error
    ? '1px solid rgba(211, 60, 60, 0.3)'
    : `1px solid ${props.theme.colors.background.elevation3}`,
  backgroundColor: props.theme.colors.background.elevation_1,
  borderRadius: 8,
  paddingLeft: props.theme.spacing(5),
  paddingRight: props.theme.spacing(5),
  height: 44,
  ':focus-within': {
    border: `1px solid ${props.theme.colors.background.elevation6}`,
  },
}));

const NextButtonContainer = styled.div((props) => ({
  position: 'sticky',
  bottom: 0,
  paddingBottom: props.theme.spacing(12),
  paddingTop: props.theme.spacing(12),
  backgroundColor: props.theme.colors.elevation0,
}));

const Label = styled.label((props) => ({
  ...props.theme.body_medium_m,
  display: 'flex',
  flex: 1,
}));

const InputFieldContainer = styled.div(() => ({
  flex: 1,
}));

const InputField = styled.input((props) => ({
  ...props.theme.body_m,
  backgroundColor: props.theme.colors.background.elevation_1,
  color: props.theme.colors.white['0'],
  width: '100%',
  border: 'transparent',
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_medium_m,
}));

const BalanceText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['400'],
  marginRight: props.theme.spacing(2),
}));

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(3),
  marginBottom: props.theme.spacing(12),
}));

const InputGroup = styled.div`
  margin-top: ${(props) => props.theme.spacing(8)}px;
`;

const StyledCallout = styled(Callout)`
  margin-bottom: ${(props) => props.theme.spacing(14)}px;
`;

interface Props {
  token: FungibleToken;
  amountError: InputFeedbackProps | null;
  amountToSend: string;
  onAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  recipientAddress: string;
  recipientError: InputFeedbackProps | null;
  onAddressChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPressNext: () => void;
  processing: boolean;
  isNextEnabled: boolean;
}

function Brc20TransferForm(props: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND_BRC20' });
  const {
    token,
    amountToSend,
    onAmountChange,
    amountError,
    recipientAddress,
    recipientError,
    onAddressChange,
    onPressNext,
    processing,
    isNextEnabled,
  } = props;

  const tokenCurrency = getFtTicker(token);

  return (
    <Container>
      <div>
        <BRC20TokenTagContainer>
          <BRC20TokenTag>
            <h1>{t('BRC20_TOKEN')}</h1>
          </BRC20TokenTag>
        </BRC20TokenTagContainer>
        <TokenContainer>
          <TokenImage token="FT" loading={false} fungibleToken={token} />
        </TokenContainer>
        <InputGroup>
          <RowContainer>
            <Label>{t('AMOUNT')}</Label>
            <BalanceText>{t('BALANCE')}:</BalanceText>
            <Text>
              <NumericFormat
                value={token.balance.toString()}
                displayType="text"
                thousandSeparator
              />
            </Text>
          </RowContainer>
          <AmountInputContainer error={isDangerFeedback(amountError)}>
            <InputFieldContainer>
              <InputField value={amountToSend} placeholder="0" onChange={onAmountChange} />
            </InputFieldContainer>
            <Text>{tokenCurrency}</Text>
          </AmountInputContainer>
          <ErrorContainer>{amountError && <InputFeedback {...amountError} />}</ErrorContainer>
        </InputGroup>
        <InputGroup>
          <RowContainer>
            <Label>{t('RECIPIENT')}</Label>
          </RowContainer>
          <AmountInputContainer error={isDangerFeedback(recipientError)}>
            <InputFieldContainer>
              <InputField
                value={recipientAddress}
                placeholder="Ordinals address"
                onChange={onAddressChange}
              />
            </InputFieldContainer>
          </AmountInputContainer>
          <ErrorContainer>{recipientError && <InputFeedback {...recipientError} />}</ErrorContainer>
        </InputGroup>
        <StyledCallout bodyText={t('MAKE_SURE_THE_RECIPIENT')} />
      </div>
      <NextButtonContainer>
        <ActionButton
          text={t('NEXT')}
          disabled={!isNextEnabled}
          processing={processing}
          onPress={onPressNext}
        />
      </NextButtonContainer>
    </Container>
  );
}

export default Brc20TransferForm;
