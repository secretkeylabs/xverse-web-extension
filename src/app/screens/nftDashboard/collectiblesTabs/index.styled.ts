import WrenchErrorMessage from '@components/wrenchErrorMessage';
import Button from '@ui-library/button';
import { StyledP, StyledTabList } from '@ui-library/common.styled';
import styled from 'styled-components';

export const GridContainer = styled.div<{
  $isGalleryOpen: boolean;
}>((props) => ({
  display: 'grid',
  columnGap: props.$isGalleryOpen ? props.theme.space.xl : props.theme.space.m,
  rowGap: props.$isGalleryOpen ? props.theme.space.xl : props.theme.space.l,
  marginTop: props.theme.space.l,
  gridTemplateColumns: props.$isGalleryOpen
    ? 'repeat(auto-fill,minmax(220px,1fr))'
    : 'repeat(auto-fill,minmax(150px,1fr))',
}));

export const RareSatsTabContainer = styled.div((props) => ({
  marginTop: props.theme.space.l,
}));

export const StickyStyledTabList = styled(StyledTabList)`
  position: sticky;
  background: ${(props) => props.theme.colors.elevation0};
  top: -1px;
  z-index: 1;
  padding: ${(props) => props.theme.space.m} 0;
`;

export const StyledTotalItems = styled(StyledP)`
  margin-top: ${(props) => props.theme.space.s};
`;

export const NoticeContainer = styled.div((props) => ({
  marginTop: props.theme.space.m,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

export const StyledWrenchErrorMessage = styled(WrenchErrorMessage)`
  margin-top: ${(props) => props.theme.space.xxl};
`;

export const NoCollectiblesText = styled.div((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.space.xl,
  textAlign: 'center',
}));

export const LoadMoreButtonContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: props.theme.spacing(30),
  marginTop: props.theme.space.xl,
  button: {
    width: 156,
  },
}));

export const LoaderContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export const CountLoaderContainer = styled.div((props) => ({
  marginTop: props.theme.space.s,
  marginBottom: props.theme.space.l,
}));

export const StyledButton = styled(Button)`
  &.tertiary {
    color: ${(props) => props.theme.colors.white_200};
    padding: 0;
    width: auto;
    min-height: 20px;

    &:hover:enabled {
      opacity: 0.8;
    }
  }
`;

export const TopBarContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: props.theme.space.s,
}));
