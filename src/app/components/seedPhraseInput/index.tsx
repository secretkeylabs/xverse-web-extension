import { InputFeedback } from '@ui-library/inputFeedback';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import SeedWordInput from './seedWordInput';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${(props) => props.theme.space.l};
`;

const InputGrid = styled.div<{ $visible?: boolean }>`
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: ${(props) => props.theme.space.m};
  max-height: ${(props) => (props.$visible ? '400px' : '0')};
  overflow: hidden;
  transition: max-height 0.1s ease-in-out;
  :not(:first-child) {
    margin-top: ${(props) => (props.$visible ? '16px' : '0')};
  }
`;

const ErrorWrapper = styled.div`
  margin-top: ${(props) => props.theme.space.xxl};
`;

const TransparentButton = styled.button`
  ${(props) => props.theme.typography.body_m};
  background-color: transparent;
  border: none;
  color: ${(props) => props.theme.colors.white_200};
  text-decoration: underline;
  margin-top: ${(props) => props.theme.space.xxl};
  transition: color 0.1s ease;
  :hover,
  :focus {
    color: ${(props) => props.theme.colors.white_400};
  }
`;

const seedInit: string[] = [];
for (let i = 0; i < 24; i += 1) {
  seedInit.push('');
}

type Props = {
  onSeedChange: (seed: string) => void;
  seedError: string;
  setSeedError: (err: string) => void;
  initialShow24Words: boolean;
};

export default function SeedPhraseInput({
  onSeedChange,
  seedError,
  setSeedError,
  initialShow24Words = false,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_WALLET_SCREEN' });
  const [seedInputValues, setSeedInputValues] = useState([...seedInit]);
  const [show24Words, setShow24Words] = useState(initialShow24Words);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleKeyDownInput = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    // disable common special characters
    // eslint-disable-next-line no-useless-escape
    if (event.key.match(/^[!-\/:-@[-`{-~]$/)) {
      event.preventDefault();
    }
    // focus next input on space key
    if (event.key === ' ') {
      inputsRef.current[index + 1]?.focus();
      event.preventDefault();
    }
  };

  const handleChangeInput = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (seedError) {
      setSeedError('');
    }

    setSeedInputValues((prevSeed) => {
      prevSeed[index] = event.target.value;
      return [...prevSeed];
    });
  };

  const handlePaste = (pastedText: string) => {
    const splitPastedText = pastedText.split(' ');
    // Automatically show/hide 24 words based on pasted text length
    if (splitPastedText.length > 12) {
      setShow24Words(true);
    } else {
      setShow24Words(false);
    }

    setSeedInputValues((prevSeed) =>
      // To prevent unnecessary rerenders
      prevSeed.map((value, index) => splitPastedText[index] || value),
    );
  };

  useEffect(() => {
    const seedPhrase = seedInputValues
      .slice(0, !show24Words ? 12 : 24)
      .filter(Boolean)
      .join(' ');
    onSeedChange(seedPhrase);
  }, [seedInputValues, onSeedChange, show24Words]);

  const handleClickShow24Words = () => {
    setShow24Words((prev) => !prev);
    setSeedInputValues((prev) => prev.slice(0, 12).concat(seedInit.slice(0, 12)));
  };

  return (
    <InputContainer>
      <InputGrid $visible>
        {seedInputValues.slice(0, 12).map((value, index) => (
          <SeedWordInput
            key={index} // eslint-disable-line react/no-array-index-key
            value={value}
            index={index}
            handleChangeInput={handleChangeInput(index)}
            handleKeyDownInput={handleKeyDownInput(index)}
            handlePaste={handlePaste}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            autoFocus={index === 0}
          />
        ))}
      </InputGrid>
      <InputGrid $visible={show24Words}>
        {seedInputValues.slice(12, 24).map((value, i) => {
          const index = i + 12;
          return (
            <SeedWordInput
              key={index} // eslint-disable-line react/no-array-index-key
              value={value}
              index={index}
              handleChangeInput={handleChangeInput(index)}
              handleKeyDownInput={handleKeyDownInput(index)}
              handlePaste={handlePaste}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              disabled={!show24Words}
              autoFocus={index === 0}
            />
          );
        })}
      </InputGrid>
      {!!seedError && (
        <ErrorWrapper>
          <InputFeedback message={seedError} variant="danger" />
        </ErrorWrapper>
      )}
      <TransparentButton onClick={handleClickShow24Words} type="button">
        {t('HAVE_A_COUNT_WORDS_SEED_PHRASE', { number: show24Words ? '12' : '24' })}
      </TransparentButton>
    </InputContainer>
  );
}
