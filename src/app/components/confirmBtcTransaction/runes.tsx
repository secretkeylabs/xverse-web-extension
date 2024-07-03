import { StyledP } from '@ui-library/common.styled';
import styled from 'styled-components';

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  paddingTop: props.theme.space.m,
  justifyContent: 'center',
  marginBottom: props.theme.space.s,
}));

export const RowCenter = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const AddressLabel = styled(StyledP)((props) => ({
  marginLeft: props.theme.space.xxs,
}));

export const Header = styled(RowCenter)((props) => ({
  marginBottom: props.theme.space.m,
  padding: `0 ${props.theme.space.m}`,
}));

export const StyledPillLabel = styled.p`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.space.s};
`;

export const Pill = styled.span`
  ${(props) => props.theme.typography.body_bold_s}
  color: ${(props) => props.theme.colors.elevation0};
  background-color: ${(props) => props.theme.colors.white_0};
  padding: 3px 6px;
  border-radius: 40px;
`;

export const RuneValue = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

export const RuneSymbol = styled(StyledP)((props) => ({
  marginLeft: props.theme.space.xxs,
}));

export const RuneData = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

export const RuneImage = styled.div((props) => ({
  height: 32,
  width: 32,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: props.theme.colors.white_850,
}));

export const RuneAmount = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.space.xs,
}));
