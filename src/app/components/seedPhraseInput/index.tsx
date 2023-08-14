import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Eye, EyeSlash } from '@phosphor-icons/react';

const Label = styled.label`
  ${(props) => props.theme.body_medium_m};
  display: block;
  margin-bottom: ${(props) => props.theme.spacing(4)}px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  ${(props) => props.theme.body_medium_m};
  max-width: 144px;
  min-height: ${(props) => props.theme.spacing(22)}px;
  background-color: ${(props) => props.theme.colors.background.elevation0};
  color: ${(props) => props.theme.colors.white['0']};
  border: 1px solid ${(props) => props.theme.colors.background.elevation3};
  border-radius: ${(props) => props.theme.radius(1)}px;
  padding: ${(props) => props.theme.spacing(8)}px ${(props) => props.theme.spacing(6)}px;
  padding-right: ${(props) => props.theme.spacing(26)}px;
  caret-color: ${(props) => props.theme.colors.background.elevation6};
  :focus-within {
    border: 1px solid ${(props) => props.theme.colors.background.elevation6};
  }
`;

const Icon = styled.i`
  position: absolute;
  vertical-align: middle;
  background-color: transparent;
  color: ${(props) => props.theme.colors.white['0']};
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

function SeedWordInput({
  value,
  index,
  handleChangeInput,
  disabled,
}: {
  value: string;
  index: number;
  handleChangeInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  const [showValue, setShowValue] = useState(false);

  const handleFocusInput = () => setShowValue(true);
  const handleBlurInput = () => setShowValue(false);
  const handlePasteInput = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
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
          onPaste={handlePasteInput}
          onFocus={handleFocusInput}
          onBlur={handleBlurInput}
          disabled={disabled}
        />
      </InputGroup>
    </div>
  );
}

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
  ${(props) => props.theme.body_s};
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  text-align: center;
  color: ${(props) => props.theme.colors.feedback.error};
  margin-top: ${(props) => props.theme.spacing(12)}px;
  margin-bottom: ${(props) => props.theme.spacing(15)}px;
`;

const TransparentButton = styled.button`
  ${(props) => props.theme.body_m};
  background-color: transparent;
  border: none;
  color: ${(props) => props.theme.colors.white['200']};
  text-decoration: underline;
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
  const [seedInput, setSeedInput] = useState([...seedInit]);
  const [show24Words, setShow24Words] = useState(false);

  const handleChangeInput = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (seedError) {
      setSeedError('');
    }

    setSeedInput((prevSeed) => {
      prevSeed[index] = event.target.value;
      return [...prevSeed];
    });
  };

  useEffect(() => {
    const seedPhrase = seedInput
      .slice(0, !show24Words ? 12 : 24)
      .filter(Boolean)
      .join(' ');
    onSeedChange(seedPhrase);
  }, [seedInput, onSeedChange, show24Words]);

  const handleClickShow24Words = () => {
    setShow24Words((prev) => !prev);
    setSeedInput((prev) => prev.slice(0, 12).concat(seedInit.slice(0, 12)));
  };

  return (
    <InputContainer>
      <InputGrid visible>
        {seedInput.slice(0, 12).map((value, index) => (
          <SeedWordInput
            key={index} // eslint-disable-line react/no-array-index-key
            value={value}
            index={index}
            handleChangeInput={handleChangeInput(index)}
          />
        ))}
      </InputGrid>
      <InputGrid visible={show24Words}>
        {seedInput.slice(12, 24).map((value, index) => (
          <SeedWordInput
            key={index + 12} // eslint-disable-line react/no-array-index-key
            value={value}
            index={index + 12}
            handleChangeInput={handleChangeInput(index + 12)}
            disabled={!show24Words}
          />
        ))}
      </InputGrid>
      <ErrorMessage visible={!!seedError}>{seedError}</ErrorMessage>
      <TransparentButton onClick={handleClickShow24Words}>
        {t('HAVE_A_24_WORDS_SEEDPHRASE?', { number: show24Words ? '12' : '24' })}
      </TransparentButton>
    </InputContainer>
  );
}
