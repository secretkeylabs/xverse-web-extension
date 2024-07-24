import DropDownIcon from '@assets/img/transactions/dropDownIcon.svg';
import BundleItem from '@components/confirmBtcTransactionComponent/bundleItem';
import { Butterfly } from '@phosphor-icons/react';
import { animated, config, useSpring } from '@react-spring/web';
import { StyledP } from '@ui-library/common.styled';
import Divider from '@ui-library/divider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Theme from 'theme';
import Avatar from '../../../ui-library/avatar';
import { mapTxSatributeInfoToBundleInfo, type SatRangeTx } from '../utils';

const SatsBundleContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${(props) => props.theme.space.s};
`;

const SatsBundleButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colors.elevation1};
`;

const RangesContainer = styled(animated.div)((props) => ({
  borderRadius: props.theme.space.s,
  backgroundColor: props.theme.colors.elevation2,
  padding: `${props.theme.space.s} 0`,
  marginTop: props.theme.space.m,
}));

const Range = styled.div`
  padding: 0 ${(props) => props.theme.space.s};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const BundleInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: ${(props) => props.theme.space.s};
`;

function RareSats({
  satributesInfo,
  bundleSize,
}: {
  satributesInfo: { satRanges: SatRangeTx[]; totalExoticSats: number };
  bundleSize?: number;
}) {
  const [showBundleDetail, setShowBundleDetail] = useState(false);

  const { t } = useTranslation('translation');

  const slideInStyles = useSpring({
    config: { ...config.gentle, duration: 400 },
    from: { opacity: 0, height: 0 },
    to: {
      opacity: showBundleDetail ? 1 : 0,
      height: showBundleDetail ? 'auto' : 0,
    },
  });

  const arrowRotation = useSpring({
    transform: showBundleDetail ? 'rotate(180deg)' : 'rotate(0deg)',
    config: { ...config.stiff },
  });

  return (
    <SatsBundleContainer>
      <SatsBundleButton
        type="button"
        onClick={() => setShowBundleDetail((prevState) => !prevState)}
      >
        <Row>
          <Avatar icon={<Butterfly size={18} color={Theme.colors.elevation0} />} />
          <BundleInfo>
            <StyledP typography="body_medium_m" color="white_200">{`${
              satributesInfo.totalExoticSats
            } ${t('NFT_DASHBOARD_SCREEN.RARE_SATS')}`}</StyledP>
            {bundleSize && (
              <NumericFormat
                value={bundleSize}
                displayType="text"
                thousandSeparator
                prefix={`${t('COMMON.SIZE')}: `}
                suffix={` ${t('COMMON.SATS')}`}
                renderText={(value: string) => (
                  <StyledP typography="body_medium_s" color="white_400">
                    {value}
                  </StyledP>
                )}
              />
            )}
          </BundleInfo>
        </Row>
        <animated.img style={arrowRotation} src={DropDownIcon} alt="Drop Down" />
      </SatsBundleButton>

      {showBundleDetail && (
        <RangesContainer style={slideInStyles}>
          {satributesInfo.satRanges.map((item: SatRangeTx, index: number) => (
            <div key={item.offset}>
              <Range>
                <BundleItem item={mapTxSatributeInfoToBundleInfo(item)} />
              </Range>
              {satributesInfo.satRanges.length > index + 1 && <Divider verticalMargin="s" />}
            </div>
          ))}
        </RangesContainer>
      )}
    </SatsBundleContainer>
  );
}

export default RareSats;
