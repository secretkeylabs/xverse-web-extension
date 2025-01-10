import styled from 'styled-components';
import * as TDStyles from '../../../styles';
import { Card, CardStack } from '../../card';

const { Container } = TDStyles;

const OriginatingPrincipalDescription = TDStyles.Title;

const PostConditionCodeDescription = styled.div(({ theme }) => ({
  ...theme.typography.body_medium_m,
  color: theme.colors.white_400,
}));

const AssetDescriptionContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  columnGap: theme.space.m,
}));

const IconContainer = styled.div(({ theme }) => ({
  height: theme.space.xl,
  width: theme.space.xl,
  position: 'relative',
}));

const Icon = styled.img(({ theme }) => ({
  height: theme.space.xl,
  width: theme.space.xl,
  borderRadius: '100%',
  position: 'absolute',
  left: 0,
  top: 0,
}));

const SubIcon = styled.img(({ theme }) => ({
  height: theme.space.l,
  width: theme.space.l,
  border: `${theme.space.xxxs} solid ${theme.colors.elevation0}`,
  borderRadius: '100%',
  position: 'absolute',
  right: `-${theme.space.s}`,
  bottom: 0,
}));

const DataContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.space.xxxs,
  flexGrow: 1,
}));

const DataRow = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const DataMainText = styled.div(({ theme }) => ({
  ...theme.typography.body_medium_m,
  color: theme.colors.white_0,
}));

const DataSecondaryText = styled.div(({ theme }) => ({
  ...theme.typography.body_s,
  color: theme.colors.white_400,
}));

export const PostConditionStyles = {
  Container,
  OriginatingPrincipalDescription,
  Card,
  CardStack,
  PostConditionCodeDescription,
  AssetDescriptionContainer,
  IconContainer,
  Icon,
  SubIcon,
  DataContainer,
  DataRow,
  DataMainText,
  DataSecondaryText,
};
