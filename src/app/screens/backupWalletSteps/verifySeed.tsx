import Button from '@ui-library/button';
import { InputFeedback } from '@ui-library/inputFeedback';
import { generateMnemonic } from 'bip39';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  paddingTop: props.theme.spacing(21),
  flexDirection: 'column',
  flex: 1,
}));

const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  flex: 1,
  alignItems: 'flex-end',
  marginBottom: props.theme.spacing(30),
  width: '100%',
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const Heading = styled.h3((props) => ({
  ...props.theme.typography.body_l,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(16),
}));

const WordGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${(props) => props.theme.spacing(5)}px;
  margin-bottom: ${(props) => props.theme.spacing(12)}px;
`;

const WordButton = styled.button`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_0};
  background-color: ${(props) => props.theme.colors.elevation3};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${(props) => props.theme.spacing(6)}px;
  border-radius: ${(props) => props.theme.radius(1)}px;
  transition: opacity 0.1s ease;
  :hover:enabled,
  :focus:enabled {
    opacity: 0.8;
  }
  :active:enabled {
    opacity: 0.6;
  }
`;

const NthSpan = styled.span`
  ${(props) => props.theme.typography.body_bold_l};
  color: ${(props) => props.theme.colors.white_0};
`;

const ErrorMessage = styled.div<{ $visible: boolean }>`
  visibility: ${(props) => (props.$visible ? 'initial' : 'hidden')};
`;

const getOrdinal = (num: number): string => {
  switch (num) {
    case 1:
      return '1st';
    case 2:
      return '2nd';
    case 3:
      return '3rd';
    default:
      return `${num}th`;
  }
};

export default function VerifySeed({
  onBack,
  onVerifySuccess,
  seedPhrase,
}: {
  onBack: () => void;
  onVerifySuccess: () => void;
  seedPhrase: string;
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'BACKUP_WALLET_SCREEN' });
  const [err, setErr] = useState('');
  const [correctCounter, setCorrectCounter] = useState(0);
  const [quiz, setQuiz] = useState<{ words: string[]; answer: string; nth: string }>({
    words: [],
    answer: '',
    nth: '',
  });

  const generateWords = useCallback(() => {
    const seedWords = seedPhrase.split(' ');
    const seedPhraseIndex = Math.floor(Math.random() * seedWords.length);
    const answer = seedWords[seedPhraseIndex];

    const randomWords = generateMnemonic().split(' ');

    // check randomWords doesn't contain our answer already.
    // only if it doesn't, do we need to insert the answer at a random index.
    const foundAnswerIndex = randomWords.findIndex((word) => word === answer);
    if (foundAnswerIndex === -1) {
      const randomWordsIndex = Math.floor(Math.random() * randomWords.length);
      randomWords[randomWordsIndex] = answer;
    }

    const nth = getOrdinal(seedPhraseIndex + 1);
    setQuiz({ words: randomWords, answer, nth });
  }, [seedPhrase]);

  useEffect(() => {
    if (correctCounter >= 3) {
      return onVerifySuccess();
    }
    generateWords();
  }, [correctCounter, onVerifySuccess, generateWords]);

  const handleClickWord = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.value === quiz.answer) {
      setErr('');
      return setCorrectCounter((prev) => prev + 1);
    }
    setErr(t('SEED_PHRASE_INCORRECT'));
  };

  return (
    <Container>
      <Heading>{t('CONFIRM_YOUR_SEEDPHRASE')}</Heading>
      <Heading>
        {t('SELECT_THE')}
        <NthSpan>{quiz.nth}</NthSpan>
        {t('WORD_OF_YOUR_SEEDPHRASE')}
      </Heading>
      <WordGrid>
        {quiz.words.map((word) => (
          <WordButton
            key={`${word}-${correctCounter}`}
            onClick={handleClickWord}
            value={word}
            translate="no"
          >
            {word}
          </WordButton>
        ))}
      </WordGrid>
      <ErrorMessage $visible={!!err}>
        <InputFeedback message={err} variant="danger" />
      </ErrorMessage>
      <ButtonsContainer>
        <TransparentButtonContainer>
          <Button onClick={onBack} variant="secondary" title={t('SEED_PHRASE_BACK_BUTTON')} />
        </TransparentButtonContainer>
      </ButtonsContainer>
    </Container>
  );
}
