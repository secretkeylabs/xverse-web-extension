import RuneAmount from '@components/confirmBtcTransaction/itemRow/runeAmount';
import { RuneSummary } from '@secretkeylabs/xverse-core';
import InputFeedback from '@ui-library/inputFeedback';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

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

type Props = {
  burns?: RuneSummary['burns'];
};

function BurnSection({ burns }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  if (!burns?.length) return null;

  return (
    <Container>
      <Header spaceBetween>
        <InputFeedback variant="danger" message={t('YOU_WILL_BURN')} />
      </Header>
      {burns.map((burn) => (
        <RowContainer key={burn.runeName}>
          <RuneAmount
            tokenName={burn.runeName}
            amount={String(burn.amount)}
            divisibility={burn.divisibility}
          />
        </RowContainer>
      ))}
    </Container>
  );
}

export default BurnSection;
