import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: props.theme.space.m,
  justifyContent: 'center',
  marginBottom: props.theme.space.s,
}));

const TitleText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
}));

const DescriptionText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  marginTop: props.theme.space.xs,
  color: props.theme.colors.white_0,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
});

type Props = {
  memo: string;
};

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
