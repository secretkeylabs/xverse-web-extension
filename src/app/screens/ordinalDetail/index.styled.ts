import { BetterBarLoader } from '@components/barLoader';
import Separator from '@components/separator';
import WebGalleryButton from '@components/webGalleryButton';
import Callout from '@ui-library/callout';
import { StyledP } from '@ui-library/common.styled';
import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';

interface DetailSectionProps {
  isGallery: boolean;
}

export const GalleryScrollContainer = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignItems: 'center',
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

export const BackButtonContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  width: '100%',
  maxWidth: 820,
  marginTop: props.theme.spacing(40),
  button: {
    width: 'auto',
  },
}));

export const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  position: 'relative',
  flexDirection: 'row',
  maxWidth: 400,
  columnGap: props.theme.space.m,
  marginBottom: props.theme.spacing(10.5),
}));

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

export const OrdinalsContainer = styled.div((props) => ({
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

export const ExtensionOrdinalsContainer = styled.div((props) => ({
  maxHeight: 136,
  width: 136,
  display: 'flex',
  aspectRatio: '1',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.m,
}));

export const OrdinalTitleText = styled.h1((props) => ({
  ...props.theme.typography.headline_m,
  color: props.theme.colors.white_0,
  marginTop: props.theme.spacing(1),
  textAlign: 'center',
}));

export const OrdinalGalleryTitleText = styled.h1((props) => ({
  ...props.theme.typography.headline_l,
  color: props.theme.colors.white_0,
}));

export const DescriptionText = styled.h1((props) => ({
  ...props.theme.typography.headline_l,
  color: props.theme.colors.white_0,
  fontSize: 24,
}));

export const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

export const RowContainer = styled.div<{
  withGap?: boolean;
}>((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(12),
  flexDirection: 'row',
  columnGap: props.withGap ? props.theme.spacing(20) : 0,
}));

export const ColumnContainer = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  width: '100%',
});

export const OrdinalDetailsContainer = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  width: props.isGallery ? 400 : '100%',
  marginTop: props.theme.spacing(8),
}));

export const Row = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'row',
  width: '100%',
});

export const DescriptionContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: props.theme.spacing(30),
}));

export const StyledWebGalleryButton = styled(WebGalleryButton)`
  margin-top: ${(props) => props.theme.space.xs};
`;

export const ViewInExplorerButton = styled.button<DetailSectionProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  width: props.isGallery ? 392 : 328,
  height: 44,
  padding: 12,
  borderRadius: 12,
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(18),
  border: `1px solid ${props.theme.colors.white_800}`,
}));

export const ButtonText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
}));

export const ButtonHiglightedText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
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

export const CollectibleText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_400,
  textAlign: 'center',
}));

export const GalleryCollectibleText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_l,
  color: props.theme.colors.white_400,
}));

export const GalleryButtonContainer = styled.div`
  width: 190px;
  border-radius: 12px;
`;

export const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  columnGap: props.theme.spacing(11),
  marginBottom: props.theme.space.l,
  marginTop: props.theme.space.m,
  width: '100%',
}));

export const Divider = styled.div((props) => ({
  width: '100%',
  borderBottom: `1px solid ${props.theme.colors.elevation3}`,
}));

export const DetailSection = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  flexDirection: !props.isGallery ? 'row' : 'column',
  justifyContent: 'space-between',
  columnGap: props.theme.space.m,
  width: '100%',
}));

export const StyledBarLoader = styled(BetterBarLoader)<{
  withMarginBottom?: boolean;
}>((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
  marginBottom: props.withMarginBottom ? props.theme.space.s : 0,
}));

export const RareSatsBundleCallout = styled(Callout)<DetailSectionProps>((props) => ({
  width: props.isGallery ? 400 : '100%',
  marginBottom: props.isGallery ? 0 : props.theme.space.l,
  marginTop: props.isGallery ? props.theme.space.xs : 0,
}));

export const SatributesIconsContainer = styled.div<DetailSectionProps>((props) => ({
  display: 'inline-flex',
  flexDirection: 'row',
  marginTop: props.isGallery ? props.theme.space.m : 0,
}));

export const SatributesBadgeContainer = styled.div<DetailSectionProps>((props) => ({
  marginTop: props.isGallery ? 0 : props.theme.space.m,
}));
export const SatributesBadges = styled.div<DetailSectionProps>((props) => ({
  display: 'inline-flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  maxWidth: props.isGallery ? 400 : '100%',
  marginTop: props.theme.space.s,
}));
export const Badge = styled.div<{ backgroundColor?: string; isLastItem: boolean }>((props) => ({
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: props.backgroundColor,
  padding: `${props.theme.space.s} ${props.theme.space.s}`,
  borderRadius: props.theme.radius(2),
  border: `1px solid ${props.theme.colors.elevation3}`,
  marginRight: props.isLastItem ? 0 : props.theme.space.xs,
  marginBottom: props.theme.space.xs,
}));
export const SatributeBadgeLabel = styled(StyledP)`
  margin-left: ${(props) => props.theme.space.xs};
`;
export const DataItemsContainer = styled.div`
  margin-top: ${(props) => props.theme.space.l};
`;
