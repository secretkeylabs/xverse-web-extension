import styled from 'styled-components';

const SeedWord = styled.p((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(16),
}));

const OrdinalNumber = styled.p((props) => ({
  ...props.theme.body_medium_m,
  marginLeft: props.theme.spacing(7),
  marginRight: props.theme.spacing(1.5),
  marginTop: props.theme.spacing(16),
  color: props.theme.colors.white_400,
}));

const Container = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

interface Props {
  index: number;
  word: string;
}

function SeedPhraseWord({ index, word }: Props) {
  return (
    <Container>
      <OrdinalNumber>{index + 1}.</OrdinalNumber>
      <SeedWord key={word} translate="no">
        {word}
      </SeedWord>
    </Container>
  );
}

export default SeedPhraseWord;
