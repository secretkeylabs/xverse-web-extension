import { BetterBarLoader } from '@components/barLoader';
import WebGalleryButton from '@components/webGalleryButton';
import WrenchErrorMessage from '@components/wrenchErrorMessage';
import Button from '@ui-library/button';
import styled from 'styled-components';

interface DetailSectionProps {
  $isGalleryOpen?: boolean;
}

/* layout */
// TODO tim: create a reusable layout
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  ${(props) => props.theme.scrollbar}
`;

export const PageHeader = styled.div<DetailSectionProps>`
  padding: ${(props) => props.theme.space.xs};
  padding-top: 0;
  max-width: 1224px;
  margin-top: ${(props) => (props.$isGalleryOpen ? props.theme.space.xxl : props.theme.space.l)};
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

// TODO tim: use media queries for this once we get responsive layouts with breakpoints
export const PageHeaderContent = styled.div<DetailSectionProps>`
  display: flex;
  flex-direction: ${(props) => (props.$isGalleryOpen ? 'row' : 'column')};
  justify-content: ${(props) => (props.$isGalleryOpen ? 'space-between' : 'initial')};
  row-gap: ${(props) => props.theme.space.xl};
`;

export const AttributesContainer = styled.div<DetailSectionProps>`
  display: flex;
  flex-direction: ${(props) => (props.$isGalleryOpen ? 'column' : 'row')};
  justify-content: ${(props) => (props.$isGalleryOpen ? 'space-between' : 'initial')};
  column-gap: ${(props) => props.theme.space.m};
`;

export const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

/* components */

export const StyledWebGalleryButton = styled(WebGalleryButton)`
  margin-top: ${(props) => props.theme.space.xs};
`;

export const StyledWrenchErrorMessage = styled(WrenchErrorMessage)`
  margin-top: ${(props) => props.theme.space.xxl};
`;

export const NoCollectiblesText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(16),
  marginBottom: 'auto',
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

export const StyledBarLoader = styled(BetterBarLoader)((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
  marginTop: props.theme.spacing(2),
}));

export const StyledButton = styled(Button)`
  &.tertiary {
    justify-content: flex-start;
    color: ${(props) => props.theme.colors.white_200};
    padding-left: 0;

    &:hover:enabled {
      opacity: 0.8;
    }
  }
`;

export const CollectionNameDiv = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.space.s};
`;
