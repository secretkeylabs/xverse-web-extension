import Eye from '@assets/img/createPassword/Eye.svg';
import { useMemo } from 'react';
import styled from 'styled-components';
import SeedPhraseWord from './word';

interface SeedPhraseViewProps {
  seedPhrase: string;
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
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
  gridTemplateColumns: ' 100px 100px 100px',
  textAlign: 'center',
  margin: 0,
  columnGap: props.theme.spacing(3),
  paddingBottom: props.theme.spacing(17),
  paddingLeft: props.theme.spacing(5),
  filter: `blur(${props.isVisible ? 0 : '3px'})`,
  userSelect: 'none',
}));

const OuterSeedContainer = styled.div((props) => ({
  backgroundColor: props.theme.colors.elevation_n1,
  border: `1px solid ${props.theme.colors.elevation3}`,
  borderRadius: props.theme.radius(1),
}));

const ShowSeedButton = styled.button((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white_0,
  backgroundColor: props.theme.colors.white_900,
  border: `1px solid ${props.theme.colors.white_600}`,
  height: 36,
  width: 110,
  borderRadius: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  img: {
    marginRight: props.theme.spacing(4),
  },
  ':hover': {
    backgroundColor: props.theme.colors.white_850,
    border: `1px solid ${props.theme.colors.white_800}`,
  },
  ':focus': {
    backgroundColor: props.theme.colors.white_600,
    border: `1px solid ${props.theme.colors.white_800}`,
  },
}));

export default function SeedphraseView(props: SeedPhraseViewProps) {
  const { seedPhrase, isVisible, setIsVisible } = props;
  const seedPhraseWords = useMemo(() => seedPhrase?.split(' '), [seedPhrase]);

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <Container>
      <OuterSeedContainer>
        <SeedContainer isVisible={isVisible}>
          {seedPhraseWords.map((word, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <SeedPhraseWord key={index} index={index} word={word} />
          ))}
        </SeedContainer>
      </OuterSeedContainer>

      {!isVisible && (
        <ShowSeedButton onClick={handleToggleVisibility}>
          <img src={Eye} alt="show-password" height={16} />
          Show
        </ShowSeedButton>
      )}
    </Container>
  );
}
