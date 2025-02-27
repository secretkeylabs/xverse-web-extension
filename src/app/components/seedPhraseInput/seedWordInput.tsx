import { Eye, EyeSlash } from '@phosphor-icons/react';
import React, { useState } from 'react';
import styled from 'styled-components';
import Theme from 'theme';

const Label = styled.label`
  ${(props) => props.theme.typography.body_medium_m};
  display: block;
  color: ${(props) => props.theme.colors.white_200};
  margin-bottom: ${(props) => props.theme.space.xs};
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  ${(props) => props.theme.typography.body_medium_m};
  width: 100%;
  max-width: 169px;
  min-height: 44px;
  background-color: ${(props) => props.theme.colors.elevation_n1};
  color: ${(props) => props.theme.colors.white_0};
  border: 1px solid ${(props) => props.theme.colors.white_900};
  border-radius: ${(props) => props.theme.radius(1)}px;
  padding: ${(props) => props.theme.space.s};
  padding-right: ${(props) => props.theme.spacing(26)}px;
  caret-color: ${(props) => props.theme.colors.tangerine};
  ::selection {
    background-color: ${(props) => props.theme.colors.tangerine};
    color: ${(props) => props.theme.colors.elevation0};
  }
  :focus-within {
    border: 1px solid ${(props) => props.theme.colors.white_600};
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
  margin-right: ${(props) => props.theme.space.m};
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

      const { clipboardData } = e;
      const pastedText = clipboardData.getData('text');
      handlePaste(pastedText);
    };

    return (
      <div>
        <Label htmlFor={`input${index}`}>{`${index + 1}.`}</Label>
        <InputGroup>
          <Icon tabIndex={-1}>
            {showValue ? (
              <Eye size={20} color={Theme.colors.white_200} weight="fill" />
            ) : (
              <EyeSlash size={20} color={Theme.colors.white_200} weight="fill" />
            )}
          </Icon>
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

export default SeedWordInput;
