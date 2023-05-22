import TokenImage from '@components/tokenImage';
import { FungibleToken } from '@secretkeylabs/xverse-core';
import { getTicker } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
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

interface ContainerProps {
  error: boolean;
}

const AmountInputContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  border: props.error
    ? '1px solid rgba(211, 60, 60, 0.3)'
    : `1px solid ${props.theme.colors.background.elevation3}`,
  backgroundColor: props.theme.colors.background['elevation-1'],
  borderRadius: 8,
  paddingLeft: props.theme.spacing(5),
  paddingRight: props.theme.spacing(5),
  height: 44,
  ':focus-within': {
    border: `1px solid ${props.theme.colors.background.elevation6}`,
  },
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  flex: 1,
  display: 'flex',
}));

const InputFieldContainer = styled.div(() => ({
  flex: 1,
}));

const InputField = styled.input((props) => ({
  ...props.theme.body_m,
  backgroundColor: props.theme.colors.background['elevation-1'],
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
}));

const ErrorText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.feedback.error,
}));

interface Props {
  amountError: string;
  amountToSend: string;
  onAmountChange: (event: React.FormEvent<HTMLInputElement>) => void;
  token: FungibleToken;
}

function Brc20TransferForm(props: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND_BRC_20' });
  const {
    amountToSend, onAmountChange, amountError, token,
  } = props;

  function getTokenCurrency() {
    if (token) {
      if (token?.ticker) {
        return token.ticker.toUpperCase();
      }
      if (token?.name) {
        return getTicker(token.name).toUpperCase();
      }
    }
  }
  return (
    <Container>
      <TokenContainer>
        <TokenImage token="FT" loading={false} fungibleToken={token || undefined} />
      </TokenContainer>
      <RowContainer>
        <TitleText>{t('AMOUNT')}</TitleText>
        <BalanceText>
          {t('BALANCE')}
          :
        </BalanceText>
        <Text>{token.balance}</Text>
      </RowContainer>
      <AmountInputContainer error={amountError !== ''}>
        <InputFieldContainer>
          <InputField value={amountToSend} placeholder="0" onChange={onAmountChange} />
        </InputFieldContainer>
        <Text>{getTokenCurrency()}</Text>
      </AmountInputContainer>
      <ErrorContainer>
        <ErrorText>{amountError}</ErrorText>
      </ErrorContainer>
    </Container>
  );
}

export default Brc20TransferForm;
