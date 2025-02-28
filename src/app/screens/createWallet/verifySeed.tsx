import { Spinner } from '@phosphor-icons/react';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { useMutation } from '@tanstack/react-query';
import Button from '@ui-library/button';
import { InputFeedback } from '@ui-library/inputFeedback';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ButtonsContainer,
  Container,
  ErrorMessage,
  Heading,
  LoadingContainer,
  NthSpan,
  TransparentButtonContainer,
  WordButton,
  WordGrid,
} from './verifySeed.styles';

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

const numberChallenges = 3;

function Wrapper({ children }: PropsWithChildren) {
  const { t } = useTranslation('translation', { keyPrefix: 'BACKUP_WALLET_SCREEN' });
  return (
    <Container>
      <Heading>{t('CONFIRM_YOUR_SEED_PHRASE')}</Heading>
      {children}
    </Container>
  );
}

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

  const [error, setError] = useState('');
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  const { data, isLoading, mutate, isSuccess } = useMutation({
    mutationFn: async () => {
      if (!mnemonic) throw new Error("Couldn't retrieve mnemonic from vault.");

      const words = mnemonic.split(' ');
      const wordsWithIndex = words.map((word, index) => ({ word, index }));

      // Grab `numberChallenges` random words to test.
      const testWords: { word: string; index: number }[] = [];
      for (let i = 0; i < numberChallenges; i++) {
        const randomIndex = Math.floor(Math.random() * wordsWithIndex.length);
        testWords.push(wordsWithIndex.splice(randomIndex, 1)[0]);
      }

      // For each of the test words, generate a mnemonic and substitute a random
      // word with the test word.
      const challenges = testWords.map(({ word, index }) => {
        let randomWords = generateMnemonic(wordlist).split(' ');
        // Ensure the new random mnemonic doesn't contain the word we're testing.
        while (randomWords.includes(word)) {
          randomWords = generateMnemonic(wordlist).split(' ');
        }
        const randomWordsIndex = Math.floor(Math.random() * randomWords.length);
        randomWords[randomWordsIndex] = word;

        return {
          words: randomWords,
          answer: word,
          index,
        };
      });

      return challenges;
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  const handleClickWord = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isSuccess) throw new Error('Expected the challenge generation to have completed.');

    const { answer } = data[currentChallengeIndex];
    if (e.currentTarget.value !== answer) {
      setError(t('SEED_PHRASE_INCORRECT'));
      return;
    }

    setError('');
    if (currentChallengeIndex >= numberChallenges - 1) {
      // with this correct guess, we have 3 confirmed words, so we can continue
      onVerifySuccess();
      return;
    }

    setCurrentChallengeIndex(currentChallengeIndex + 1);
  };

  if (isLoading)
    return (
      <Wrapper>
        <LoadingContainer>
          <Spinner size={50} />
        </LoadingContainer>
      </Wrapper>
    );

  // TODO: Handle challenge generation errors.

  if (isSuccess)
    return (
      <Wrapper>
        <Heading>
          {t('SELECT_THE')}
          <NthSpan data-testid="nth-word">
            {getOrdinal(data[currentChallengeIndex].index + 1)}
          </NthSpan>
          {t('WORD_OF_YOUR_SEED_PHRASE')}
        </Heading>
        <WordGrid>
          {data[currentChallengeIndex].words.map((word) => (
            <WordButton
              key={`${word}-${currentChallengeIndex}`}
              onClick={handleClickWord}
              value={word}
              translate="no"
            >
              {word}
            </WordButton>
          ))}
        </WordGrid>
        <ErrorMessage $visible={!!error}>
          <InputFeedback message={error} variant="danger" />
        </ErrorMessage>
        <ButtonsContainer>
          <TransparentButtonContainer>
            <Button onClick={onBack} variant="secondary" title={t('SEED_PHRASE_BACK_BUTTON')} />
          </TransparentButtonContainer>
        </ButtonsContainer>
      </Wrapper>
    );
}
