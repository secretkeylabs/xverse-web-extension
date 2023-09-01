import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  justifyContent: 'center',
  marginBottom: 12,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
}));

const DescriptionText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(2),
  color: props.theme.colors.white_0,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
});

interface Props {
  memo: string;
}

function TransferMemoView({ memo }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  return (
    <Container>
      <RowContainer>
        <TitleText>{t('MEMO')}</TitleText>
      </RowContainer>
      <DescriptionText>{memo}</DescriptionText>
    </Container>
  );
}

export default TransferMemoView;
