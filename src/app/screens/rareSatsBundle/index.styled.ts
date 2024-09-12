import Separator from '@components/separator';
import WebGalleryButton from '@components/webGalleryButton';
import styled from 'styled-components';

interface DetailSectionProps {
  isGalleryOpen?: boolean;
}

/* layout */
export const Container = styled.div<DetailSectionProps>`
  ...${(props) => props.theme.scrollbar};
  overflow-y: auto;
  padding-bottom: ${(props) => props.theme.space.l};
  padding-left: ${(props) => (props.isGalleryOpen ? 0 : props.theme.space.m)};
  padding-right: ${(props) => (props.isGalleryOpen ? 0 : props.theme.space.m)};
`;

export const PageHeader = styled.div<DetailSectionProps>`
  padding: ${(props) => (props.isGalleryOpen ? props.theme.space.m : 0)};
  padding-top: 0;
  max-width: 1224px;
  margin-top: ${(props) => (props.isGalleryOpen ? props.theme.space.xxl : props.theme.space.l)};
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

// TODO tim: use media queries for this once we get responsive layouts with breakpoints
export const PageHeaderContent = styled.div<DetailSectionProps>`
  display: flex;
  flex-direction: ${(props) => (props.isGalleryOpen ? 'row' : 'column')};
  justify-content: ${(props) => (props.isGalleryOpen ? 'space-between' : 'initial')};
`;

export const AttributesContainer = styled.div<DetailSectionProps>((props) => ({
  maxWidth: props.isGalleryOpen ? '285px' : '100%',
}));

export const StyledSeparator = styled(Separator)`
  margin-bottom: ${(props) => props.theme.space.xxl};
`;

/* components */

export const StyledWebGalleryButton = styled(WebGalleryButton)`
  color: ${(props) => props.theme.colors.white_200};
  margin-top: ${(props) => props.theme.space.xs};
`;

export const SendButtonContainer = styled.div<DetailSectionProps>`
  margin-top: ${(props) => props.theme.space.l};
  width: ${(props) => (props.isGalleryOpen ? '222px' : '100%')};
`;

export const BundleRarityLinkContainer = styled.button`
  margin-top: ${(props) => props.theme.space.l};
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${(props) => props.theme.space.xxs};
  background-color: transparent;
  color: ${(props) => props.theme.colors.white_200};
  :hover:enabled {
    color: ${(props) => props.theme.colors.white_200};
  }
  :active ;
  :disabled {
    color: ${(props) => props.theme.colors.white_400};
  }
  svg {
    flex-grow: 0;
    flex-shrink: 0;
  }
`;

export const BackButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: ${(props) => props.theme.space.xxl};
`;

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

export const AssetDetailButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 400,
  fontSize: 14,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

export const NoCollectiblesText = styled.p((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(16),
  marginBottom: 'auto',
  textAlign: 'center',
}));

export const Header = styled.div<{ isGalleryOpen: boolean }>((props) => ({
  display: props.isGalleryOpen ? 'block' : 'flex',
  flexDirection: props.isGalleryOpen ? 'row' : 'column',
  alignItems: 'flex-start',
}));

export const SatRangeContainer = styled.div<DetailSectionProps>((props) => ({
  marginTop: props.isGalleryOpen ? 0 : props.theme.space.s,
  maxWidth: '1224px',
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
}));

export const DetailSection = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  flexDirection: props.isGalleryOpen ? 'column' : 'row',
  justifyContent: 'space-between',
  columnGap: props.theme.space.m,
  width: '100%',
}));

export const SeeRarityContainer = styled.div`
  padding: ${(props) => props.theme.space.l} ${(props) => props.theme.space.m};
`;

export const RuneAmountContainer = styled.div<{ isGalleryOpen?: boolean }>((props) => ({
  padding: props.isGalleryOpen ? `0 ${props.theme.space.m}` : 0,
  marginBottom: props.theme.space.s,
}));
