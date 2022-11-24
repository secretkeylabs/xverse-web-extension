import { useMemo, useState } from 'react';
import styled from 'styled-components';
import Eye from '@assets/img/createPassword/Eye.svg';

interface SeedPhraseViewProps {
  seedPhrase: string;
}

interface SeedContainerProps {
  isVisible: boolean;
}

const Container = styled.div({
  position: 'relative',
});

const SeedContainer = styled.div<SeedContainerProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  backgroundColor: props.theme.colors.background['elevation-1'],
  border: `1px solid ${props.theme.colors.background.elevation2}`,
  borderRadius: props.theme.radius(1),
  paddingBottom: props.theme.spacing(17),
  paddingLeft: props.theme.spacing(5),
  filter: `blur(${props.isVisible ? 0 : '3px'})`,
}));

const SeedWord = styled.p((props) => ({
  ...props.theme.body_medium_m,
  width: '25%',
  marginTop: props.theme.spacing(17),
  marginRight: props.theme.spacing(4),
  marginLeft: props.theme.spacing(9),
}));

const ShowSeedButton = styled.button((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white[0],
  backgroundColor: props.theme.colors.background.elevation2,
  height: 36,
  width: 110,
  borderRadius: props.theme.radius(3),
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
}));

export default function SeedphraseView(props: SeedPhraseViewProps) {
  const { seedPhrase } = props;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const seedPhraseWords = useMemo(() => seedPhrase?.split(' '), [seedPhrase]);

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <Container>
      <SeedContainer isVisible={isVisible}>
        {seedPhraseWords.map((word, index) => (
          <SeedWord key={word}>
            {index + 1}
            {'. '}
            {word}
          </SeedWord>
        ))}
      </SeedContainer>
      {!isVisible && (
        <ShowSeedButton onClick={handleToggleVisibility}>
          <img src={Eye} alt="show-password" height={24} />
          Show
        </ShowSeedButton>
      )}
    </Container>
  );
}
