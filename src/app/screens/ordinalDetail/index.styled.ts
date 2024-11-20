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

export const ExtensionOrdinalsContainer = styled.div<{ $isGalleryOpen: boolean }>((props) => ({
  maxHeight: props.$isGalleryOpen ? 174 : 136,
  width: props.$isGalleryOpen ? 174 : 136,
  display: 'flex',
  aspectRatio: '1',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(2),
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.m,
}));

export const OrdinalTitleText = styled.h1((props) => ({
  ...props.theme.typography.headline_m,
  color: props.theme.colors.white_0,
  marginTop: props.theme.spacing(1),
  textAlign: 'center',
}));

export const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

export const ColumnContainer = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  width: '100%',
});

export const OrdinalDetailsContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  width: '100%',
  marginTop: props.theme.spacing(8),
}));

export const Row = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'row',
  width: '100%',
});

export const StyledWebGalleryButton = styled(WebGalleryButton)`
  margin-top: ${(props) => props.theme.space.xs};
`;

export const ViewInExplorerButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  width: '100%',
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

export const OrdinalTitleContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  gap: props.theme.space.s,
}));

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

export const ExtensionLoaderContainer = styled.div((props) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
  paddingBottom: props.theme.space.l,
  ...props.theme.scrollbar,
}));

export const StyledBarLoader = styled(BetterBarLoader)<{
  withMarginBottom?: boolean;
}>((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
  marginBottom: props.withMarginBottom ? props.theme.spacing(6) : 0,
}));

export const StyledSeparator = styled(Separator)`
  width: 100%;
`;

export const TitleLoader = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ActionButtonsLoader = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  columnGap: props.theme.spacing(11),
}));

export const ActionButtonLoader = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: props.theme.space.xs,
}));

export const InfoContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: props.theme.space.m,
  padding: `0 ${props.theme.space.m}`,
}));

export const InfoContainerColumn = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: props.theme.space.xs,
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
