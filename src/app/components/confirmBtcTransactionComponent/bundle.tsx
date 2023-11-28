import BundleIcon from '@assets/img/rareSats/satBundle.svg';
import AssetModal from '@components/assetModal';
import { CaretDown } from '@phosphor-icons/react';
import { Bundle, BundleSatRange, SatRangeInscription } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';
import BundleItem from './bundleItem';

interface BundleItemContainerProps {
  addMargin: boolean;
}

const BundleItemsContainer = styled.div<BundleItemContainerProps>`
  margin-top: ${(props) => (props.addMargin ? props.theme.space.m : 0)};
`;

const SatsBundleContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${(props) => props.theme.space.s};
  border-radius: ${(props) => props.theme.space.s};
  padding: ${(props) => props.theme.space.m};
  background-color: ${(props) => props.theme.colors.elevation1};
`;

const SatsBundleButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colors.elevation1};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const BundleTitle = styled(StyledP)`
  margin-left: ${(props) => props.theme.space.s};
`;

const BundleValue = styled(StyledP)`
  margin-right: ${(props) => props.theme.space.xs};
`;

const Title = styled(StyledP)((props) => ({
  marginBottom: props.theme.space.xs,
}));

function SatsBundle({ bundle, title }: { bundle: Bundle; title?: string }) {
  const [showBundleDetail, setShowBundleDetail] = useState(false);
  const [inscriptionToShow, setInscriptionToShow] = useState<SatRangeInscription | undefined>(
    undefined,
  );

  const { t } = useTranslation('translation');

  return (
    <>
      {inscriptionToShow && (
        <AssetModal
          onClose={() => setInscriptionToShow(undefined)}
          inscription={inscriptionToShow}
        />
      )}
      <SatsBundleContainer>
        {title && <Title typography="body_medium_m">{title}</Title>}
        <SatsBundleButton
          type="button"
          onClick={() => setShowBundleDetail((prevState) => !prevState)}
        >
          <Row>
            <img src={BundleIcon} alt="bundle" />
            <BundleTitle typography="body_medium_m" color="white_200">
              {t('RARE_SATS.SATS_BUNDLE')}
            </BundleTitle>
          </Row>
          <Row>
            <BundleValue typography="body_medium_m" color="white_0">{`${bundle.totalExoticSats} ${t(
              'NFT_DASHBOARD_SCREEN.RARE_SATS',
            )}`}</BundleValue>
            <CaretDown color={Theme.colors.white_0} size={16} />
          </Row>
        </SatsBundleButton>

        {showBundleDetail &&
          bundle.satRanges.map((item: BundleSatRange, index: number) => (
            <BundleItemsContainer key={`${item.block}-${item.offset}`} addMargin={index === 0}>
              <BundleItem
                item={item}
                ordinalEyePressed={(inscription: SatRangeInscription) => {
                  // show ordinal modal to show asset
                  setInscriptionToShow(inscription);
                }}
                showDivider={index !== bundle.satRanges.length - 1}
              />
            </BundleItemsContainer>
          ))}
      </SatsBundleContainer>
    </>
  );
}

export default SatsBundle;
