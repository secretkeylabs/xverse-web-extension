import styled from 'styled-components';

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: `0 ${props.theme.space.m} ${props.theme.space.l} ${props.theme.space.m}`,
  zIndex: 1,
  backgroundColor: props.theme.colors.elevation0,
}));

export const SlippageButton = styled.button<{ $showWarning: boolean }>`
  display: flex;
  flex-direction: row;
  column-gap: ${(props) => props.theme.space.xxs};
  background: transparent;
  align-items: center;
  ${(props) => props.theme.typography.body_medium_m};
  border-radius: 24px;
  border: 1px solid ${(props) => props.theme.colors.white_800};
  padding: ${(props) => props.theme.space.xxs} ${(props) => props.theme.space.s};
  color: ${(props) =>
    props.$showWarning ? props.theme.colors.caution : props.theme.colors.white_0};
`;

export const CalloutContainer = styled.div`
  margin-bottom: ${(props) => props.theme.space.m};
`;

export const Flex1 = styled.div`
  flex: 1;
  margin-top: 12px;
`;

export const SendButtonContainer = styled.div((props) => ({
  marginBottom: props.theme.space.s,
}));

export const ListingDescContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.m,
}));

export const ListingDescriptionRow = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  flex: 1;
  justify-content: space-between;
  min-height: 24px;
`;

export const RouteContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  gap: 4px;
`;

export const QuoteToBaseContainer = styled.div`
  margin-top: 4px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ArrowOuterContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const ArrowInnerContainer = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border: 1px solid ${(props) => props.theme.colors.white_850};
  background-color: ${(props) => props.theme.colors.background.elevation0};
  padding: 8px;
`;

export const EditFeeRateContainer = styled.div`
  margin-top: ${(props) => props.theme.space.xxs};
`;

export const FeeRate = styled.div`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_0};
  display: flex;
  flex-direction: row;
  align-self: flex-start;
`;
