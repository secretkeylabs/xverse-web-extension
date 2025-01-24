import { Container, Heading } from '@screens/stxSignTransactions/styles';
import styled from 'styled-components';
import { Actions, type Props as ActionProps } from '../../../../../shared/actions';

type Props = {
  image: { src: string; alt: string };
  title: string;
  subtitle: string;
  actions?: ActionProps;
};

const CalloutContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  flexGrow: 1,
});

const BodyContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  rowGap: theme.space.xl,
}));

const ContentContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.space.xs,
}));

const Text = styled.div(({ theme }) => ({
  ...theme.typography.body_m,
  color: theme.colors.white_400,
}));

export function Layout(props: Props) {
  const { image, title, subtitle, actions } = props;
  return (
    <Container>
      <CalloutContainer>
        <BodyContainer>
          <img src={image.src} alt={image.alt} />
          <ContentContainer>
            <Heading>{title}</Heading>
            <Text>{subtitle}</Text>
          </ContentContainer>
        </BodyContainer>
      </CalloutContainer>
      {actions && <Actions {...actions} />}
    </Container>
  );
}
