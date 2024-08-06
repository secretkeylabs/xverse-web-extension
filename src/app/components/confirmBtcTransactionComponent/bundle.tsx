import AssetModal from '@components/assetModal';
import { Butterfly, CaretDown } from '@phosphor-icons/react';
import { animated, config, useSpring } from '@react-spring/web';
import type { Bundle, BundleSatRange, SatRangeInscription } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Divider from '@ui-library/divider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';
import BundleItem from './bundleItem';

const BundleItemsContainer = styled.div<{
  $withMargin: boolean;
}>`
  margin-top: ${(props) => (props.$withMargin ? props.theme.space.m : 0)};
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

const Title = styled(StyledP)((props) => ({
  marginBottom: props.theme.space.xs,
}));

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.colors.white_0};
  border-radius: 50%;
  padding: 6px;
`;

function SatsBundle({ bundle, title }: { bundle: Bundle; title?: string }) {
  const { t } = useTranslation('translation');

  const [showBundleDetail, setShowBundleDetail] = useState(false);
  const [inscriptionToShow, setInscriptionToShow] = useState<SatRangeInscription | undefined>(
    undefined,
  );

  const arrowRotation = useSpring({
    transform: showBundleDetail ? 'rotate(180deg)' : 'rotate(0deg)',
    config: { ...config.stiff },
  });

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
            <IconContainer>
              <Butterfly size={18} color={Theme.colors.elevation0} />
            </IconContainer>
            <BundleTitle typography="body_medium_m" color="white_0">
              {`${bundle.totalExoticSats} ${t(
                bundle.totalExoticSats > 1
                  ? 'NFT_DASHBOARD_SCREEN.RARE_SATS'
                  : 'NFT_DASHBOARD_SCREEN.RARE_SAT',
              )}`}
            </BundleTitle>
          </Row>
          <Row>
            <animated.div style={arrowRotation}>
              <CaretDown color={Theme.colors.white_0} size={16} />
            </animated.div>
          </Row>
        </SatsBundleButton>

        {showBundleDetail &&
          bundle.satRanges.map((item: BundleSatRange, index: number) => (
            <BundleItemsContainer key={`${item.block}-${item.offset}`} $withMargin={index === 0}>
              <BundleItem
                item={item}
                ordinalEyePressed={(inscription: SatRangeInscription) => {
                  // show ordinal modal to show asset
                  setInscriptionToShow(inscription);
                }}
              />
              {bundle.satRanges.length > index + 1 && <Divider verticalMargin="s" />}
            </BundleItemsContainer>
          ))}
      </SatsBundleContainer>
    </>
  );
}

export default SatsBundle;
