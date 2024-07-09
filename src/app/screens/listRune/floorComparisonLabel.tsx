import { Warning, WarningOctagon } from '@phosphor-icons/react';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme, { type Typography } from '../../../theme';

const FlexContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: props.theme.space.xxs,
  alignItems: 'center',
}));

type Props = {
  priceSats: number;
  floorPriceSats: number;
  lowError: boolean;
  highError: boolean;
  typography: Typography;
};

function FloorComparisonLabel({
  priceSats,
  floorPriceSats,
  lowError,
  highError,
  typography,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'LIST_RUNE_SCREEN' });
  const percentageDifference = ((priceSats / floorPriceSats - 1) * 100).toFixed(2);
  return (
    <div>
      {lowError && (
        <FlexContainer>
          <Warning weight="fill" color={Theme.colors.danger_light} size={16} />
          <StyledP typography="body_medium_s" color="danger_light">
            {t('LISTING_PRICE_TOO_LOW')}
          </StyledP>
        </FlexContainer>
      )}
      {highError && (
        <FlexContainer>
          <Warning weight="fill" color={Theme.colors.danger_light} size={16} />
          <StyledP typography="body_medium_s" color="danger_light">
            {t('LISTING_PRICE_TOO_HIGH')}
          </StyledP>
        </FlexContainer>
      )}
      {!lowError && !highError && (
        <>
          {priceSats === floorPriceSats && (
            <StyledP typography={typography} color="white_200">
              {t('AT_FLOOR_PRICE_LABEL')}
            </StyledP>
          )}
          {priceSats > floorPriceSats && (
            <StyledP typography={typography} color="white_200">
              {t('ABOVE_FLOOR_PRICE_LABEL', { percentage: percentageDifference })}
            </StyledP>
          )}
          {priceSats < floorPriceSats && (
            <FlexContainer>
              <WarningOctagon weight="fill" color={Theme.colors.caution} size={16} />
              <StyledP typography={typography} color="caution">
                {t('BELOW_FLOOR_PRICE_LABEL', { percentage: percentageDifference })}
              </StyledP>
            </FlexContainer>
          )}
        </>
      )}
    </div>
  );
}

export default FloorComparisonLabel;
