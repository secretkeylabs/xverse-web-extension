import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';

interface DetailSectionProps {
  $isGallery: boolean;
}

export const ExtensionContainer = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.space.xs,
  alignItems: 'center',
  flex: 1,
  paddingLeft: props.theme.space.xs,
  paddingRight: props.theme.space.xs,
}));

export const BackButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  width: 800,
  marginTop: props.theme.spacing(40),
}));

export const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  columnGap: props.theme.spacing(11),
  paddingBottom: props.theme.spacing(16),
  marginBottom: props.theme.space.xs,
  marginTop: props.theme.space.xs,
  width: '100%',
  borderBottom: `1px solid ${props.theme.colors.elevation3}`,
}));

export const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export const NftContainer = styled.div((props) => ({
  width: 376.5,
  height: 376.5,
  display: 'flex',
  aspectRatio: '1',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  borderRadius: 8,
  marginBottom: props.theme.space.l,
}));

export const ExtensionNftContainer = styled.div((props) => ({
  maxHeight: 148,
  width: 148,
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  marginBottom: props.theme.space.l,
}));

export const NftTitleText = styled.h1((props) => ({
  ...props.theme.typography.headline_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
  wordBreak: 'break-word',
}));

export const CollectibleText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_400,
  textAlign: 'center',
}));

export const NftGalleryTitleText = styled.h1((props) => ({
  ...props.theme.typography.headline_l,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.space.xs,
}));

export const NftOwnedByText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  textAlign: 'center',
}));

export const OwnerAddressText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'center',
  marginLeft: props.theme.spacing(3),
}));

export const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

export const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

export const GridContainer = styled.div((props) => ({
  display: 'grid',
  width: '100%',
  marginTop: props.theme.spacing(6),
  columnGap: props.theme.space.xs,
  rowGap: props.theme.space.xs,
  gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
  marginBottom: props.theme.space.m,
}));

export const DescriptionContainer = styled.div((props) => ({
  display: 'flex',
  marginLeft: props.theme.space.xxl,
  flexDirection: 'column',
  marginBottom: props.theme.spacing(30),
}));

export const AttributeText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
}));

export const WebGalleryButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.space.xs,
  marginBottom: props.theme.space.l,
}));

export const WebGalleryButtonText = styled.div((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_200,
  textAlign: 'center',
}));

export const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

export const BackButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  background: 'transparent',
  marginBottom: props.theme.space.l,
}));

export const SeeDetailsButtonContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(27),
  marginTop: props.theme.space.xs,
}));

export const Button = styled.button<DetailSectionProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  width: props.$isGallery ? 400 : 328,
  height: 44,
  padding: 12,
  borderRadius: 12,
  marginTop: props.theme.spacing(6),
  border: `1px solid ${props.theme.colors.white_800}`,
}));

export const ButtonText = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_400,
}));

export const AssetDeatilButtonText = styled.div((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_0,
  marginLeft: 2,
  textAlign: 'center',
}));

export const GalleryCollectibleText = styled.p((props) => ({
  ...props.theme.typography.body_bold_l,
  color: props.theme.colors.white_400,
}));

export const GalleryScrollContainer = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignItems: 'center',
}));

export const ButtonHiglightedText = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_0,
  marginLeft: props.theme.space.xxs,
  marginRight: props.theme.space.xxs,
}));

export const GalleryRowContainer = styled.div<{
  $withGap?: boolean;
}>((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.l,
  flexDirection: 'row',
  columnGap: props.$withGap ? props.theme.space.m : 0,
}));

export const StyledTooltip = styled(Tooltip)`
  &&& {
    font-size: 12px;
    background-color: #ffffff;
    color: #12151e;
    border-radius: 8px;
    padding: 7px;
  }
`;

export const GalleryContainer = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  maxWidth: 1224,
});

export const NftDetailsContainer = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  width: props.$isGallery ? 400 : '100%',
  marginTop: props.theme.space.m,
}));

export const DetailSection = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  flexDirection: !props.$isGallery ? 'row' : 'column',
  justifyContent: 'center',
  width: '100%',
  columnGap: props.theme.space.m,
}));
