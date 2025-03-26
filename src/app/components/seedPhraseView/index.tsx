import styled from 'styled-components';
import SeedPhraseWord from './word';

interface SeedPhraseViewProps {
  seedPhrase: string;
  isVisible: boolean;
}
interface SeedContainerProps {
  isVisible: boolean;
}

const Container = styled.div((props) => ({
  position: 'relative',
  paddingBottom: props.theme.spacing(20),
}));

const SeedContainer = styled.div<SeedContainerProps>((props) => ({
  display: 'grid',
  gridTemplateColumns: ' 1fr 1fr 1fr',
  textAlign: 'center',
  margin: 0,
  columnGap: props.theme.spacing(3),
  paddingBottom: props.theme.spacing(17),
  paddingLeft: props.theme.spacing(5),
  userSelect: 'none',
}));

const OuterSeedContainer = styled.div((props) => ({
  backgroundColor: props.theme.colors.elevation_n1,
  border: `1px solid ${props.theme.colors.elevation3}`,
  borderRadius: props.theme.radius(1),
}));

export default function SeedPhraseView(props: SeedPhraseViewProps) {
  const { seedPhrase, isVisible } = props;
  const seedPhraseWords = seedPhrase?.split(' ');

  return (
    <Container>
      <OuterSeedContainer>
        <SeedContainer isVisible={isVisible}>
          {seedPhraseWords.map((word, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <SeedPhraseWord isVisible={isVisible} key={index} index={index} word={word} />
          ))}
        </SeedContainer>
      </OuterSeedContainer>
    </Container>
  );
}
