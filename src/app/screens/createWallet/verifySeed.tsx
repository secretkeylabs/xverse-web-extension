import { Spinner } from '@phosphor-icons/react';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import Button from '@ui-library/button';
import { InputFeedback } from '@ui-library/inputFeedback';
import { useEffect, useState } from 'react';
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

const LoadingContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.space.xxl,
  width: '100%',
}));

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
  mnemonic,
  onBack,
  onVerifySuccess,
}: {
  mnemonic: string;
  onBack: () => void;
  onVerifySuccess: () => void;
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'BACKUP_WALLET_SCREEN' });

  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [challenge, setChallenge] = useState<{ words: string[]; answer: string; index: number }>({
    words: [],
    answer: '',
    index: -1,
  });

  const generateChallenge = async (alreadyCheckedIndexes: number[]) => {
    setIsLoading(true);

    const seedWords = mnemonic!.split(' ');
    let seedPhraseIndex = Math.floor(Math.random() * seedWords.length);

    while (alreadyCheckedIndexes.includes(seedPhraseIndex)) {
      seedPhraseIndex = Math.floor(Math.random() * seedWords.length);
    }

    const answer = seedWords[seedPhraseIndex];

    const randomWords = generateMnemonic(wordlist).split(' ');

    // check randomWords doesn't contain our answer already.
    // only if it doesn't, do we need to insert the answer at a random index.
    const foundAnswerIndex = randomWords.findIndex((word) => word === answer);
    if (foundAnswerIndex === -1) {
      const randomWordsIndex = Math.floor(Math.random() * randomWords.length);
      randomWords[randomWordsIndex] = answer;
    }

    setChallenge({ words: randomWords, answer, index: seedPhraseIndex });
    setIsLoading(false);
  };

  useEffect(() => {
    // generate initial challenge on load
    generateChallenge([]);
  }, []);

  const handleClickWord = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.value !== challenge.answer) {
      setErr(t('SEED_PHRASE_INCORRECT'));
      return;
    }

    setErr('');
    if (correctAnswers.length >= 2) {
      // with this correct guess, we have 3 confirmed words, so we can continue
      onVerifySuccess();
      return;
    }

    const newCorrectAnswers = [...correctAnswers, challenge.index];
    setCorrectAnswers(newCorrectAnswers);
    generateChallenge(newCorrectAnswers);
  };

  return (
    <Container>
      <Heading>{t('CONFIRM_YOUR_SEED_PHRASE')}</Heading>
      {isLoading && (
        <LoadingContainer>
          <Spinner size={50} />
        </LoadingContainer>
      )}
      {!isLoading && (
        <>
          <Heading>
            {t('SELECT_THE')}
            <NthSpan data-testid="nth-word">{getOrdinal(challenge.index + 1)}</NthSpan>
            {t('WORD_OF_YOUR_SEED_PHRASE')}
          </Heading>
          <WordGrid>
            {challenge.words.map((word) => (
              <WordButton
                key={`${word}-${correctAnswers.length}`}
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
        </>
      )}
    </Container>
  );
}
