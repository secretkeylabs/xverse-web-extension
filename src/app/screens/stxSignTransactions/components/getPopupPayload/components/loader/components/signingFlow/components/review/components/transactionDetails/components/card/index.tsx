import type { ReactNode } from 'react';
import styled from 'styled-components';

export const Card = styled.div(({ theme }) => ({
  backgroundColor: theme.colors.elevation1,
  borderRadius: theme.radius(2),
  padding: theme.space.m,
}));

export const CardStack = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.space.s,
}));

const Container = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  minHeight: theme.space.ml,
}));

const Title = styled.div(({ theme }) => ({
  ...theme.typography.body_medium_m,
  color: theme.colors.white_400,
}));

const Value = styled.div(({ theme }) => ({
  ...theme.typography.body_medium_m,
  color: theme.colors.white_0,
  textAlign: 'right',
}));

export const CardRowContainer = styled.div({});

type CardRowProps = {
  title: ReactNode;
  value: ReactNode;
};

export function CardRowPrimary({ title, value }: CardRowProps) {
  return (
    <Container>
      <Title>{title}</Title>
      <Value>{value}</Value>
    </Container>
  );
}

const TitleSecondary = styled.div(({ theme }) => ({
  ...theme.typography.body_s,
  color: theme.colors.white_400,
}));

const ValueSecondary = styled.div(({ theme }) => ({
  ...theme.typography.body_s,
  color: theme.colors.white_400,
}));

type CardRowSecondaryProps = Partial<CardRowProps>;

export function CardRowSecondary({ title, value }: CardRowSecondaryProps) {
  return (
    <Container>
      <TitleSecondary>{title}</TitleSecondary>
      <ValueSecondary>{value}</ValueSecondary>
    </Container>
  );
}
