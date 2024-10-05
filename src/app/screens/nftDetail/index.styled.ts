import { BetterBarLoader } from '@components/barLoader';
import Separator from '@components/separator';
import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';

export const ExtensionContainer = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(4),
  alignItems: 'center',
  flex: 1,
  paddingLeft: props.theme.spacing(4),
  paddingRight: props.theme.spacing(4),
}));

export const GalleryReceiveButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(6),
  width: '100%',
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
  marginBottom: props.theme.spacing(4),
  marginTop: props.theme.spacing(4),
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
  marginBottom: props.theme.spacing(12),
}));

export const ExtensionNftContainer = styled.div((props) => ({
  maxHeight: 148,
  width: 148,
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  marginBottom: props.theme.spacing(12),
}));

export const NftTitleText = styled.h1((props) => ({
  ...props.theme.typography.headline_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

export const CollectibleText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_400,
  textAlign: 'center',
}));

export const NftGalleryTitleText = styled.h1((props) => ({
  ...props.theme.typography.headline_l,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(4),
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
  columnGap: props.theme.spacing(4),
  rowGap: props.theme.spacing(4),
  gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
  marginBottom: props.theme.spacing(8),
}));

export const ShareButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(6),
  width: '100%',
}));

export const DescriptionContainer = styled.div((props) => ({
  display: 'flex',
  marginLeft: props.theme.spacing(20),
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
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(12),
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
  marginBottom: props.theme.spacing(12),
}));

export const ExtensionLoaderContainer = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
});

export const SeeDetailsButtonContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(27),
  marginTop: props.theme.spacing(4),
}));

export const Button = styled.button<DetailSectionProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  width: props.isGallery ? 400 : 328,
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
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
}));

export const GalleryRowContainer = styled.div<{
  withGap?: boolean;
}>((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(12),
  flexDirection: 'row',
  columnGap: props.withGap ? props.theme.spacing(20) : 0,
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

export const StyledBarLoader = styled(BetterBarLoader)<{
  withMarginBottom?: boolean;
}>((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
  marginBottom: props.withMarginBottom ? props.theme.spacing(6) : 0,
}));

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

export const ActionButtonLoader = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: props.theme.spacing(4),
}));

export const ActionButtonsLoader = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  columnGap: props.theme.spacing(11),
}));

export const GalleryLoaderContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export const StyledSeparator = styled(Separator)`
  width: 100%;
`;

export const TitleLoader = styled.div`
  display: flex;
  flex-direction: column;
`;
interface DetailSectionProps {
  isGallery: boolean;
}

export const NftDetailsContainer = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  width: props.isGallery ? 400 : '100%',
  marginTop: props.theme.spacing(8),
}));

export const DetailSection = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  flexDirection: !props.isGallery ? 'row' : 'column',
  justifyContent: 'center',
  width: '100%',
  columnGap: props.theme.spacing(8),
}));

export const InfoContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  padding: `0 ${props.theme.spacing(8)}px`,
}));
