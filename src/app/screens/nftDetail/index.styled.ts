import { BetterBarLoader } from '@components/barLoader';
import Separator from '@components/separator';
import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';

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

export const ExtensionNftContainer = styled.div<{ $isGalleryOpen: boolean }>((props) => ({
  maxHeight: props.$isGalleryOpen ? 174 : 136,
  width: props.$isGalleryOpen ? 174 : 136,
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(2),
  marginTop: props.theme.space.s,
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

export const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

export const GridContainer = styled.div((props) => ({
  display: 'grid',
  width: '100%',
  marginTop: props.theme.space.s,
  columnGap: props.theme.space.xs,
  rowGap: props.theme.space.xs,
  gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
  marginBottom: props.theme.space.m,
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
  marginBottom: props.theme.space.xs,
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

export const ExtensionLoaderContainer = styled.div((props) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
  paddingBottom: props.theme.space.l,
  ...props.theme.scrollbar,
}));

export const SeeDetailsButtonContainer = styled.div((props) => ({
  width: '100%',
  marginBottom: props.theme.spacing(27),
  marginTop: props.theme.space.xs,
}));

export const Button = styled.button((props) => ({
  ...props.theme.typography.body_medium_m,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  width: '100%',
  height: 44,
  padding: 12,
  borderRadius: 12,
  marginTop: props.theme.space.s,
  border: `1px solid ${props.theme.colors.white_800}`,
}));

export const ButtonText = styled.p((props) => ({
  color: props.theme.colors.white_400,
}));

export const ButtonHiglightedText = styled.p((props) => ({
  color: props.theme.colors.white_0,
  marginLeft: props.theme.space.xxs,
  marginRight: props.theme.space.xxs,
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
  $withMarginBottom?: boolean;
}>((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
  marginBottom: props.$withMarginBottom ? props.theme.space.s : 0,
}));

export const ActionButtonLoader = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: props.theme.space.xs,
}));

export const ActionButtonsLoader = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  columnGap: props.theme.spacing(11),
}));

export const StyledSeparator = styled(Separator)`
  width: 100%;
`;

export const TitleLoader = styled.div`
  display: flex;
  flex-direction: column;
`;

export const NftDetailsContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  width: '100%',
  marginTop: props.theme.space.m,
}));

export const DetailSection = styled.div<{
  $isGallery: boolean;
}>((props) => ({
  display: 'flex',
  flexDirection: !props.$isGallery ? 'row' : 'column',
  justifyContent: 'center',
  width: '100%',
  columnGap: props.theme.space.m,
}));

export const InfoContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  padding: `0 ${props.theme.space.m}`,
  marginTop: props.theme.space.m,
}));
