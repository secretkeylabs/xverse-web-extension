import ExoticSatsRow from '@components/exoticSatsRow/exoticSatsRow';
import RareSatIcon from '@components/rareSatIcon/rareSatIcon';
import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import { DotsThree } from '@phosphor-icons/react';
import { Bundle, RareSatsType } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { getFormattedTxIdVoutFromBundle } from '@utils/rareSats';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Theme from 'theme';

const Range = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 6px;
  border: 1px solid ${(props) => props.theme.colors.white_800};
  margin-left: 2px;
  align-items: center;
  padding: 1px;
`;

const TileText = styled(StyledP)`
  text-align: center;
  color: ${(props) => props.theme.colors.white_200};
  padding: 2px 3px;
`;

const Pressable = styled.button((props) => ({
  background: 'transparent',
  width: '100%',
  marginBottom: props.theme.space.s,
}));

function RareSatsTabGridItem({ bundle, maxItems }: { bundle: Bundle; maxItems: number }) {
  const navigate = useNavigate();
  const { setSelectedSatBundleDetails } = useSatBundleDataReducer();

  const handleOnClick = () => {
    // exotics v1 wont show range details only bundle details
    setSelectedSatBundleDetails(bundle);
    navigate('/nft-dashboard/rare-sats-bundle', { state: { source: 'RareSatsTab' } });
  };

  const renderedIcons = () => {
    let totalIconsDisplayed = 0;
    let totalTilesDisplayed = 0;

    const icons: (RareSatsType | 'ellipsis' | '+X')[][] = [];
    let overLimitSatsIndex: number | null = null;
    let totalSats = 0;
    let totalTiles = 0;
    bundle.satributes
      .filter((satributes) => !(satributes.includes('COMMON') && bundle.satributes.length > 1))
      .forEach((sats, index) => {
        totalSats += sats.length;
        totalTiles += 1;

        const isOverLimit =
          totalIconsDisplayed + sats.length > maxItems - (sats.length > 1 ? 2 : 1);
        // we add ranges till we reach the limit and we store the index of the range that is over the limit
        if (isOverLimit || overLimitSatsIndex !== null) {
          overLimitSatsIndex = overLimitSatsIndex !== null ? overLimitSatsIndex : index;
          return;
        }
        totalTilesDisplayed += 1;
        totalIconsDisplayed += sats.length;
        icons.push(sats);
      });

    // if we have more than 1 range and we have reached the limit we add ellipsis and +X
    if (overLimitSatsIndex !== null) {
      const sats = bundle.satributes[overLimitSatsIndex];
      const satsToDisplay = maxItems - totalIconsDisplayed - 2;
      const firstSats = sats.slice(0, satsToDisplay);
      // we add ellipsis only if we have more than 1 slot left counting the +X
      if (firstSats.length > 0) {
        totalTilesDisplayed += 1;
        icons.push([...firstSats, 'ellipsis']);
      }

      if (totalSats > maxItems) {
        icons.push(['+X']);
      }
    }

    return icons.map((sats, index) => (
      <Range key={`${bundle.satRanges[index].block}-${bundle.satRanges[index].offset}`}>
        {sats.map((satribute, indexSatributes) => {
          if (satribute === 'ellipsis') {
            return (
              <DotsThree
                key={`${totalTilesDisplayed}-ellipsis`}
                color={Theme.colors.white_200}
                size="20"
              />
            );
          }

          if (satribute === '+X') {
            return (
              <TileText key={`${totalTilesDisplayed}-+X`} typography="body_m">
                +{totalTiles - totalTilesDisplayed}
              </TileText>
            );
          }
          return (
            // eslint-disable-next-line react/no-array-index-key
            <RareSatIcon key={`${satribute}-${indexSatributes}`} type={satribute} size={24} />
          );
        })}
      </Range>
    ));
  };

  const bundleId = getFormattedTxIdVoutFromBundle(bundle);

  return (
    <Pressable type="button" onClick={handleOnClick}>
      <ExoticSatsRow
        title={bundleId}
        satAmount={bundle.value}
        inscriptions={bundle.inscriptions}
        showNumberOfInscriptions
        icons={renderedIcons()}
      />
    </Pressable>
  );
}
export default RareSatsTabGridItem;
