import { StyledP } from '@ui-library/common.styled';
import { formatNumber } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.button`
  display: flex;
  flex-direction: row;
  border: 1px solid ${({ theme }) => theme.colors.elevation6};
  border-radius: ${({ theme }) => theme.space.s};
  padding: ${({ theme }) => `${theme.space.m} ${theme.space.s}`};
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.space.xs};
  background: ${({ theme }) => theme.colors.white_900};
  width: 100%;
`;

const SmallContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin: 0 ${({ theme }) => theme.space.xs};
  align-items: flex-start;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 ${({ theme }) => theme.space.xs};
  align-items: flex-end;
  justify-content: flex-end;
`;

const FullHeightP = styled(StyledP)`
  margin-top: ${({ theme }) => theme.space.m};
`;

const Image = styled.img`
  align-self: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

interface Props {
  fromUnit?: string;
  toUnit?: string;
  rate: string;
  provider: string;
  image: string;
  onClick: () => void;
}

function QuoteSummaryTile({ fromUnit, toUnit, rate, provider, image, onClick }: Props) {
  const { t } = useTranslation('translation');

  return (
    <Container onClick={onClick}>
      <SmallContainer>
        <Image src={image} alt={`${provider} logo`} />
        <LeftColumn>
          <StyledP typography="body_bold_m" color="white_0">
            {provider}
          </StyledP>
          <StyledP typography="body_medium_m" color="white_200">
            {t('SWAP_SCREEN.RATE')}
          </StyledP>
        </LeftColumn>
      </SmallContainer>
      <SmallContainer>
        <RightColumn>
          <FullHeightP
            typography={rate.length > 7 ? 'body_medium_s' : 'body_medium_m'}
            color="white_0"
          >
            1 {fromUnit} ≈ {formatNumber(rate)} {toUnit}
          </FullHeightP>
        </RightColumn>
      </SmallContainer>
    </Container>
  );
}

export default QuoteSummaryTile;
