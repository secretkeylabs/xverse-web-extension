import ExoticSatsRow from '@components/exoticSatsRow/exoticSatsRow';
import RareSatIcon from '@components/rareSatIcon/rareSatIcon';
import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import { DotsThree } from '@phosphor-icons/react';
import { StyledP } from '@ui-library/common.styled';
import { BundleV2, getFormattedTxIdVoutFromBundle } from '@utils/rareSats';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Theme from 'theme';

const Range = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 6px;
  border: 1px solid var(--white-800, rgba(255, 255, 255, 0.2));
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

function RareSatsTabGridItem({ bundle, maxItems }: { bundle: BundleV2; maxItems: number }) {
  const navigate = useNavigate();
  const { setSelectedSatBundleDetails } = useSatBundleDataReducer();

  const handleOnClick = () => {
    // exotics v1 wont show rage details only bundle details
    setSelectedSatBundleDetails(bundle);
    navigate('/nft-dashboard/rare-sats-bundle');
  };

  const renderedIcons = () => {
    let totalIconsDisplayed = 0;
    let totalTilesDisplayed = 0;
    return bundle.satributes
      .filter((satributes) => !(satributes.includes('UNKNOWN') && bundle.satributes.length > 1))
      .map((sats, index) => {
        if (totalIconsDisplayed > maxItems) {
          return null;
        }

        if (totalIconsDisplayed >= maxItems - 1) {
          totalIconsDisplayed += 1;
          return (
            <Range key={`${totalTilesDisplayed}-ellipsis`}>
              <TileText typography="body_m">
                +{bundle.satributes.length - totalTilesDisplayed}
              </TileText>
            </Range>
          );
        }
        totalTilesDisplayed += 1;
        return (
          <Range key={`${bundle.satRanges[index].block}-${bundle.satRanges[index].offset}`}>
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
    <Pressable type="button" onClick={handleOnClick}>
      <ExoticSatsRow
        title={bundleId}
        satAmount={bundle.value}
        inscriptions={bundle.inscriptions}
        icons={renderedIcons()}
      />
    </Pressable>
  );
}
export default RareSatsTabGridItem;
