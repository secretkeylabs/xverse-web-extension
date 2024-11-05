import { GridContainer } from '@screens/nftDashboard/collectiblesTabs/index.styled';
import styled from 'styled-components';

interface Props {
  $isGalleryOpen?: boolean;
}

export const Container = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

export const NoCollectiblesText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.space.xl,
  marginBottom: 'auto',
  textAlign: 'center',
}));

export const HeadingText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_400,
}));

export const CollectionText = styled.p((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginTop: props.theme.space.xxxs,
  marginBottom: props.theme.space.xs,
  wordBreak: 'break-word',
}));

export const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

export const PageHeader = styled.div<Props>`
  padding: ${(props) => props.theme.space.xs};
  padding-top: 0;
  max-width: 1224px;
  margin-top: ${(props) => (props.$isGalleryOpen ? props.theme.space.xxl : props.theme.space.l)};
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

export const PageHeaderContent = styled.div<Props>`
  display: flex;
  flex-direction: ${(props) => (props.$isGalleryOpen ? 'row' : 'column')};
  justify-content: ${(props) => (props.$isGalleryOpen ? 'space-between' : 'initial')};
  row-gap: ${(props) => props.theme.space.xl};
`;

export const NftContainer = styled.div<Props>`
  display: flex;
  flex-direction: ${(props) => (props.$isGalleryOpen ? 'column' : 'row')};
  justify-content: ${(props) => (props.$isGalleryOpen ? 'space-between' : 'initial')};
  column-gap: ${(props) => props.theme.space.m};
`;

export const BackButtonContainer = styled.div((props) => ({
  display: 'flex',
  marginBottom: props.theme.space.xxl,
}));

export const BackButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  background: 'transparent',
  marginBottom: props.theme.space.l,
}));

export const AssetDetailButtonText = styled.div((props) => ({
  ...props.theme.typography.body_m,
  marginLeft: props.theme.space.xxxs,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

export const StyledGridContainer = styled(GridContainer)`
  margin-top: ${(props) => props.theme.space.s};
  padding: 0 ${(props) => props.theme.space.xs};
  padding-bottom: ${(props) => props.theme.space.xl};
  max-width: 1224px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

export const CollectionNameDiv = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.space.s};
`;
