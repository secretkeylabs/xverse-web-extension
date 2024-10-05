import { InputFeedback } from '@ui-library/inputFeedback';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useTxSummaryContext } from '../../hooks/useTxSummaryContext';
import RuneAmount from '../../itemRow/runeAmount';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: `${props.theme.space.m} 0`,
  justifyContent: 'center',
  marginBottom: props.theme.space.s,
}));

const RowContainer = styled.div((props) => ({
  padding: `0 ${props.theme.space.m}`,
  marginTop: `${props.theme.space.m}`,
}));

const RowCenter = styled.div<{ spaceBetween?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: props.spaceBetween ? 'space-between' : 'initial',
}));

const Header = styled(RowCenter)((props) => ({
  padding: `0 ${props.theme.space.m}`,
}));

function BurnSection() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  const { extractedTxSummary } = useTxSummaryContext();

  if (!extractedTxSummary.runes.burns?.length) return null;

  return (
    <Container>
      <Header spaceBetween>
        <InputFeedback variant="danger" message={t('YOU_WILL_BURN')} />
      </Header>
      {extractedTxSummary.runes.burns.map((burn) => (
        <RowContainer key={burn.runeName}>
          <RuneAmount rune={burn} />
        </RowContainer>
      ))}
    </Container>
  );
}

export default BurnSection;
