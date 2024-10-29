import { BestBarLoader } from '@components/barLoader';
import styled from 'styled-components';

const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.space.s};
  padding: ${(props) => props.theme.space.m} 0;
`;

export const StyledBarLoader = styled(BestBarLoader)<{
  $withMarginBottom?: boolean;
  $borderRadius?: number;
}>((props) => ({
  borderRadius: props.$borderRadius,
  marginBottom: props.$withMarginBottom ? props.theme.space.s : 0,
}));

const IconContainer = styled.div`
  display: flex;
`;

const ContentContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.xxxs};
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${(props) => props.theme.space.xxxs};
`;

function TokenTileLoader() {
  return (
    <LoaderContainer>
      <IconContainer>
        <StyledBarLoader width={32} height={32} $borderRadius={100} />
      </IconContainer>
      <ContentContainer>
        <LeftColumn>
          <StyledBarLoader width={56} height={20} />
          <StyledBarLoader width={70} height={20} />
        </LeftColumn>
        <RightColumn>
          <StyledBarLoader width={53} height={20} />
          <StyledBarLoader width={151} height={20} />
        </RightColumn>
      </ContentContainer>
    </LoaderContainer>
  );
}

export default TokenTileLoader;
