import checkmarkBold from '@assets/img/checkmark-bold.svg';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  display: 'flex',
  alignItems: 'center',
  columnGap: props.theme.space.xs,
  color: props.theme.colors.white_0,
  input: {
    cursor: 'pointer',
  },
  label: {
    cursor: 'pointer',
    userSelect: 'none',
  },
}));

const CheckboxInput = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  border: 1.5px solid ${(props) => props.theme.colors.white_0};
  border-radius: 2px;
  width: 16px;
  height: 16px;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 80%;

  &:checked {
    background-image: url(${checkmarkBold});
    background-color: ${(props) => props.theme.colors.tangerine};
    border-color: ${(props) => props.theme.colors.tangerine};
  }
`;

type Props = {
  checkboxId: string;
  text?: string;
  defaultChecked?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Checkbox({ checkboxId, text, defaultChecked = false, onChange }: Props) {
  return (
    <Container>
      <CheckboxInput id={checkboxId} defaultChecked={defaultChecked} onChange={onChange} />
      {text && <label htmlFor={checkboxId}>{text}</label>}
    </Container>
  );
}
