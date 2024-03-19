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

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type InputScreenProps = {
  inputs: React.ReactNode;
  buttons: React.ReactNode;
  header?: React.ReactNode;
};

function InputScreen({ inputs, buttons, header }: InputScreenProps) {
  return (
    <Container>
      <div>
        {header}
        <InputsContainer>{inputs}</InputsContainer>
      </div>
      <ButtonsContainer>{buttons}</ButtonsContainer>
    </Container>
  );
}

export default InputScreen;
