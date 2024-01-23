import Button from '@ui-library/button';
import Input from '@ui-library/input';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ButtonsContainer = styled.div`
  margin: ${(props) => props.theme.spacing(12)}px 0;
`;

export type InputConfig = {
  title: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  variant: 'danger' | 'default';
  feedback?: { variant: 'danger'; message: string }[];
};

type ButtonConfig = {
  title: string;
  onClick: () => void;
  disabled: boolean;
  loading?: boolean;
};

type InputScreenProps = {
  inputs: InputConfig[];
  buttons: ButtonConfig[];
  header?: React.ReactNode;
};

function InputScreen({ inputs, buttons, header }: InputScreenProps) {
  return (
    <Container>
      <div>
        {header}
        {inputs.map((input) => (
          <Input
            key={input.title}
            title={input.title}
            placeholder={input.placeholder}
            value={input.value}
            onChange={input.onChange}
            variant={input.variant}
            feedback={input.feedback}
          />
        ))}
      </div>
      <ButtonsContainer>
        {buttons.map((button) => (
          <Button
            key={button.title}
            title={button.title}
            onClick={button.onClick}
            disabled={button.disabled}
            loading={button.loading}
          />
        ))}
      </ButtonsContainer>
    </Container>
  );
}

export default InputScreen;
