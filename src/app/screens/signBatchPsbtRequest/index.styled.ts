import BottomModal from '@components/bottomModal';
import { StickyHorizontalSplitButtonContainer } from '@ui-library/common.styled';
import styled from 'styled-components';

export const OuterContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.spacing(11),
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
}));

export const ModalContainer = styled(Container)({
  marginTop: 0,
});

export const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.space.l,
}));

export const TransparentButtonContainer = styled.div((props) => ({
  marginRight: props.theme.space.s,
  width: '100%',
}));

export const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.space.l,
  textAlign: 'left',
}));

export const BundleLinkContainer = styled.button((props) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'transparent',
  color: props.theme.colors.tangerine,
  transition: 'color 0.2s ease',
  marginBottom: props.theme.space.s,
  ':hover': {
    color: props.theme.colors.tangerine_light,
  },
}));

export const BundleLinkText = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  marginRight: props.theme.space.xxs,
}));

export const StyledSheet = styled(BottomModal)`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100% !important;
  background-color: #181818 !important;
`;

export const TxReviewModalControls = styled.div((props) => ({
  display: 'flex',
  columnGap: props.theme.space.s,
  padding: `${props.theme.space.l} ${props.theme.space.m}`,
}));

export const ButtonsContainer = styled(StickyHorizontalSplitButtonContainer)`
  padding-left: ${(props) => props.theme.space.m};
  padding-right: ${(props) => props.theme.space.m};
`;
