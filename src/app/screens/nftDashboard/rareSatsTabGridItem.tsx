import BundleAsset from '@components/bundleAsset/bundleAsset';
import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import { StyledP } from '@ui-library/common.styled';
import { Bundle, getBundleId, getBundleSubText } from '@utils/rareSats';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const StyledBundleId = styled(StyledP)`
  text-align: left;
  text-wrap: nowrap;
  overflow: hidden;
  width: 100%;
`;

const StyledBundleSub = styled(StyledP)`
  text-align: left;
  text-overflow: ellipsis;
  text-wrap: nowrap;
  overflow: hidden;
  width: 100%;
`;

const GridItemContainer = styled.button`
  display: flex;
  flex-direction: column;
  background: transparent;
  gap: ${(props) => props.theme.space.s};
  width: 100%;
`;

function RareSatsTabGridItem({ bundle }: { bundle: Bundle }) {
  const navigate = useNavigate();
  const { setSelectedSatBundleDetails, setSelectedSatBundleItemIndex } = useSatBundleDataReducer();
  const isMoreThanOneItem = bundle.items?.length > 1;

  const handleOnClick = () => {
    setSelectedSatBundleDetails(bundle);
    if (isMoreThanOneItem) {
      return navigate('/nft-dashboard/rare-sats-bundle');
    }

    setSelectedSatBundleItemIndex(0);
    navigate('/nft-dashboard/rare-sats-detail');
  };

  const bundleId = getBundleId(bundle);
  const bundleSubText = getBundleSubText(bundle);

  return (
    <GridItemContainer onClick={handleOnClick}>
      <BundleAsset bundle={bundle} />
      <InfoContainer>
        <StyledBundleId typography="body_bold_m" color="white_0">
          {bundleId}
        </StyledBundleId>
        <StyledBundleSub typography="body_medium_m" color="white_400">
          {bundleSubText}
        </StyledBundleSub>
      </InfoContainer>
    </GridItemContainer>
  );
}
export default RareSatsTabGridItem;
