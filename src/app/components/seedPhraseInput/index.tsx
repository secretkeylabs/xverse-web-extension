import { Eye, EyeSlash } from '@phosphor-icons/react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Label = styled.label`
  ${(props) => props.theme.typography.body_medium_m};
  display: block;
  margin-bottom: ${(props) => props.theme.spacing(4)}px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  ${(props) => props.theme.typography.body_medium_m};
  max-width: 144px;
  min-height: ${(props) => props.theme.spacing(22)}px;
  background-color: ${(props) => props.theme.colors.elevation0};
  color: ${(props) => props.theme.colors.white_0};
  border: 1px solid ${(props) => props.theme.colors.elevation3};
  border-radius: ${(props) => props.theme.radius(1)}px;
  padding: ${(props) => props.theme.spacing(8)}px ${(props) => props.theme.spacing(6)}px;
  padding-right: ${(props) => props.theme.spacing(26)}px;
  caret-color: ${(props) => props.theme.colors.elevation6};
  :focus-within {
    border: 1px solid ${(props) => props.theme.colors.elevation6};
  }
`;

const Icon = styled.i`
  position: absolute;
  vertical-align: middle;
  background-color: transparent;
  color: ${(props) => props.theme.colors.white_0};
  border: none;
  height: 100%;
  right: 0;
  top: 0;
  margin-right: ${(props) => props.theme.spacing(8)}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  pointer-events: none;
`;

type SeedWordInputProps = {
  value: string;
  index: number;
  handleChangeInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDownInput: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handlePaste: (pastedText: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

const SeedWordInput = React.forwardRef<HTMLInputElement, SeedWordInputProps>(
  (
    { value, index, handleChangeInput, handleKeyDownInput, disabled, handlePaste, autoFocus },
    ref,
  ) => {
    const DEV_MODE = process.env.NODE_ENV === 'development';
    const [showValue, setShowValue] = useState(DEV_MODE);

    const handleFocusInput = () => setShowValue(true);
    const handleBlurInput = () => setShowValue(false);
    const handlePasteInput = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (DEV_MODE || process.env.WALLET_LABEL) {
        const { clipboardData } = e;
        const pastedText = clipboardData.getData('text');
        handlePaste(pastedText);
      }
    };

    return (
      <div>
        <Label htmlFor={`input${index}`}>{`${index + 1}.`}</Label>
        <InputGroup>
          <Icon tabIndex={-1}>{showValue ? <Eye size={20} /> : <EyeSlash size={20} />}</Icon>
          <Input
            id={`input${index}`}
            type={showValue ? 'input' : 'password'}
            value={value}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            onChange={handleChangeInput}
            onKeyDown={handleKeyDownInput}
            onPaste={handlePasteInput}
            onFocus={handleFocusInput}
            onBlur={handleBlurInput}
            disabled={disabled}
            ref={ref}
            autoFocus={autoFocus}
          />
        </InputGroup>
      </div>
    );
  },
);

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${(props) => props.theme.spacing(12)}px;
`;

const InputGrid = styled.div<{ visible?: boolean }>`
  display: grid;
  grid-template-columns: repeat(4, auto);
  row-gap: ${(props) => props.theme.spacing(8)}px;
  column-gap: ${(props) => props.theme.spacing(4)}px;
  max-height: ${(props) => (props.visible ? '400px' : '0')};
  overflow: hidden;
  transition: max-height 0.1s ease-in-out;
  :not(:first-child) {
    margin-top: ${(props) => (props.visible ? '16px' : '0')};
  }
`;

const ErrorMessage = styled.p<{ visible: boolean }>`
  ${(props) => props.theme.typography.body_s};
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  text-align: center;
  color: ${(props) => props.theme.colors.feedback.error};
  margin-top: ${(props) => props.theme.spacing(12)}px;
  margin-bottom: ${(props) => props.theme.spacing(15)}px;
`;

const TransparentButton = styled.button`
  ${(props) => props.theme.typography.body_m};
  background-color: transparent;
  border: none;
  color: ${(props) => props.theme.colors.white_200};
  text-decoration: underline;
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

export default function SeedPhraseInput({
  onSeedChange,
  seedError,
  setSeedError,
}: {
  onSeedChange: (seed: string) => void;
  seedError: string;
  setSeedError: (err: string) => void;
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_WALLET_SCREEN' });
  const [seedInputValues, setSeedInputValues] = useState([...seedInit]);
  const [show24Words, setShow24Words] = useState(false);
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
      <InputGrid visible>
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
      <InputGrid visible={show24Words}>
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
      <ErrorMessage visible={!!seedError}>{seedError}</ErrorMessage>
      <TransparentButton onClick={handleClickShow24Words} type="button">
        {t('HAVE_A_24_WORDS_SEEDPHRASE?', { number: show24Words ? '12' : '24' })}
      </TransparentButton>
    </InputContainer>
  );
}
