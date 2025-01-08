import Button from '@ui-library/button';
import styled from 'styled-components';
import { Container, Heading } from '../../../../../../../../styles';
import { Actions } from './actions';

const ContentContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  rowGap: theme.space.l,
  flexGrow: 1,
}));

type Props = {
  img: {
    src: string;
    alt: string;
  };
  heading: string;
  buttonText: string;
};

export function Final({ img, heading, buttonText }: Props) {
  return (
    <Container>
      <ContentContainer>
        <img src={img.src} alt={img.alt} />
        <Heading>{heading}</Heading>
      </ContentContainer>
      <Actions
        main={{
          title: buttonText,
          onClick: window.close,
        }}
      />
    </Container>
  );
}
