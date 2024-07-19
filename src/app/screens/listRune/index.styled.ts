import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const LoaderContainer = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  min-height: 200px;
  justify-content: center;
  align-items: center;
`;

export const Header = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.space.m,
}));

export const PaddingContainer = styled.div((props) => ({
  padding: `0 ${props.theme.space.m}`,
}));

export const MockContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const TabButton = styled.button<{ isSelected: boolean }>((props) => ({
  ...props.theme.typography.body_bold_s,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 32,
  paddingLeft: props.theme.space.s,
  paddingRight: props.theme.space.s,
  marginRight: props.theme.space.xxs,
  borderRadius: 44,
  background: props.isSelected ? props.theme.colors.elevation2 : 'transparent',
  color: props.theme.colors.white_0,
  opacity: props.isSelected ? 1 : 0.6,
  transition: 'opacity 0.1s ease',
  '&:hover': {
    opacity: 1,
  },
}));

export const TabContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: props.theme.space.xl,
}));

export const TabButtonsContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

export const ButtonImage = styled.button({
  backgroundColor: 'transparent',
});

export const ListRunesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.s};
`;

export const ScrollContainer = styled.div`
  display: flex;
  flex-direction: column;
  ${(props) => props.theme.scrollbar};
`;

export const SetRunePricesListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.s};
`;

export const SetRunePricesContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
  marginBottom: props.theme.space.m,
}));

export const SetRunePricesButtonsContainer = styled.div((props) => ({
  marginTop: props.theme.space.m,
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  gap: props.theme.space.xxs,
}));

export const StyledButton = styled(Button)((props) => ({
  minHeight: 'initial',
  padding: `${props.theme.space.xs} ${props.theme.space.s}`,
  borderRadius: '40px',
  div: {
    ...props.theme.typography.body_m,
  },
}));

export const ListingDescContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.m,
}));

export const ListingDescriptionRow = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  flex: 1;
  justify-content: space-between;
`;

export const RightAlignStyledP = styled(StyledP)`
  text-align: right;
`;

export const NoItemsContainer = styled.div((props) => ({
  padding: `${props.theme.space.m} ${props.theme.space.s}`,
}));
