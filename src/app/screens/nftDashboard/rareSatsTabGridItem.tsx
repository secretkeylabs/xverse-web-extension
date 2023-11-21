import RareSatIcon from '@components/rareSatIcon/rareSatIcon';
// import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import { StyledP } from '@ui-library/common.styled';
import { BundleV2, getFormattedTxIdVoutFromBundle } from '@utils/rareSats';
// import { useNavigate } from 'react-router-dom';
import OrdinalIcon from '@assets/img/rareSats/ic_ordinal_small.svg';
import { DotsThree } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Theme from 'theme';

const InfoContainer = styled.div`
  flex: 1,
  flex-direction: column;
  align-items: flex-start;
  margin-right: ${(props) => props.theme.space.m};
`;

const IconsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const StyledBundleId = styled(StyledP)`
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const InscriptionText = styled(StyledP)`
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-left: 4px;
  width: 80px;
`;

const StyledBundleSub = styled(StyledP)`
  text-align: left;
  width: 100%;
`;

const TileText = styled(StyledP)`
  text-align: center;
  color: ${(props) => props.theme.colors.white_200};
  padding: 2px 3px;
`;

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  flex: 1;
  padding: ${(props) => props.theme.space.m};
  margin-bottom: ${(props) => props.theme.space.s};
  border-radius: ${(props) => props.theme.space.xs};
  background-color: ${(props) => props.theme.colors.elevation1};
  justify-content: space-between;
`;

const Range = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 6px;
  border: 1px solid var(--white-800, rgba(255, 255, 255, 0.2));
  margin-left: 2px;
  align-items: center;
  padding: 1px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-direction: row;
`;

function RareSatsTabGridItem({ bundle, maxItems }: { bundle: BundleV2; maxItems: number }) {
  // const navigate = useNavigate();
  // const { setSelectedSatBundleDetails, setSelectedSatBundleItemIndex } = useSatBundleDataReducer();

  const { t } = useTranslation('translation', { keyPrefix: 'RARE_SATS' });

  const handleOnClick = () => {
    // TODO: handle UI changes before navigate to this screens
    // const isMoreThanOneItem = bundle.satRanges.length > 1;
    // setSelectedSatBundleDetails(bundle);
    // if (isMoreThanOneItem) {
    //   return navigate('/nft-dashboard/rare-sats-bundle');
    // }
    // setSelectedSatBundleItemIndex(0);
    // navigate('/nft-dashboard/rare-sats-detail');
  };

  const renderedIcons = () => {
    let totalIconsDisplayed = 0;
    let totalTilesDisplayed = 0;

    return bundle.satributes.map((sats, index) => {
      if (totalIconsDisplayed > maxItems) {
        return null;
      }

      if (totalIconsDisplayed >= maxItems - 1) {
        totalIconsDisplayed += 1;
        return (
          <Range>
            <TileText typography="body_m">
              +{bundle.satributes.length - totalTilesDisplayed}
            </TileText>
          </Range>
        );
      }
      totalTilesDisplayed += 1;
      return (
        <Range key={bundle.satRanges[index].offset}>
          {sats.map((sattribute, indexSattributes) => {
            totalIconsDisplayed += 1;
            if (totalIconsDisplayed >= maxItems - 1) {
              return null;
            }
            // eslint-disable-next-line react/no-array-index-key
            return <RareSatIcon key={`${sattribute}-${indexSattributes}`} type={sattribute} />;
          })}
          {totalIconsDisplayed > maxItems - 2 ? (
            <DotsThree color={Theme.colors.white_200} size="20" />
          ) : null}
        </Range>
      );
    });
  };

  const bundleId = getFormattedTxIdVoutFromBundle(bundle);

  return (
    <ItemContainer onClick={handleOnClick}>
      <InfoContainer>
        <StyledBundleId typography="body_bold_m" color="white_0">
          {bundleId}
        </StyledBundleId>
        <NumericFormat
          value={bundle.value}
          displayType="text"
          suffix=" Sats"
          thousandSeparator
          renderText={(value: string) => (
            <StyledBundleSub typography="body_medium_m" color="white_400">
              {value}
            </StyledBundleSub>
          )}
        />

        {bundle.inscriptions.map((inscription) => (
          <Row>
            <img src={OrdinalIcon} alt="ordinal" />
            <InscriptionText typography="body_medium_m" color="white_400">
              {inscription.id}
            </InscriptionText>
          </Row>
        ))}
      </InfoContainer>
      <IconsContainer>{renderedIcons()}</IconsContainer>
    </ItemContainer>
  );
}
export default RareSatsTabGridItem;
