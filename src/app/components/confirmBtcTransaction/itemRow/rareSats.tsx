import DropDownIcon from '@assets/img/transactions/dropDownIcon.svg';
import { Butterfly } from '@phosphor-icons/react';
import { animated, config, useSpring } from '@react-spring/web';
import { btcTransaction, type RareSatsType } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Divider from '@ui-library/divider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';
import Avatar from '../../../ui-library/avatar';
import RareSatRow from './rareSatRow';

const SatsBundleContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${(props) => props.theme.space.s};
  margin-top: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.s};
`;

const SatsBundleButton = styled.button<{ buttonColor?: string }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: props.buttonColor ?? props.theme.colors.elevation1,
}));

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

const ButterflyHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: ${(props) => props.theme.space.s};
`;

function RareSats({
  satributes,
  inscriptionSatributes,
  bundleSize,
  buttonColor,
}: {
  satributes?: btcTransaction.IOSatribute[] | Omit<btcTransaction.IOSatribute, 'offset'>[];
  inscriptionSatributes?: RareSatsType[];
  bundleSize?: number;
  buttonColor?: string;
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

  const totalExoticSats: number =
    satributes?.reduce(
      (accumulator, current) =>
        accumulator + (!current.types.includes('COMMON') ? current.amount : 0),
      0,
    ) ?? 0;

  if (!totalExoticSats && !inscriptionSatributes?.length) return null;

  return (
    <SatsBundleContainer>
      <SatsBundleButton
        type="button"
        buttonColor={buttonColor}
        onClick={() => setShowBundleDetail((prevState) => !prevState)}
      >
        <Row>
          <Avatar icon={<Butterfly size={18} color={Theme.colors.elevation0} />} />
          <ButterflyHeader>
            <StyledP typography="body_medium_m" color="white_0">
              {totalExoticSats > 0
                ? `${totalExoticSats} ${t(
                    totalExoticSats > 1
                      ? 'NFT_DASHBOARD_SCREEN.RARE_SATS'
                      : 'NFT_DASHBOARD_SCREEN.RARE_SAT',
                  )}`
                : `${t('NFT_DASHBOARD_SCREEN.RARE_SATS')}`}
            </StyledP>
          </ButterflyHeader>
        </Row>
        <animated.img style={arrowRotation} src={DropDownIcon} alt="Drop Down" />
      </SatsBundleButton>
      {showBundleDetail && (
        <RangesContainer style={slideInStyles}>
          {inscriptionSatributes && (
            <Range>
              <RareSatRow
                item={{
                  types: inscriptionSatributes,
                  amount: 0,
                  fromAddress: '',
                }}
              />
            </Range>
          )}
          {totalExoticSats > 0 &&
            satributes &&
            satributes.map((item, i) => (
              // eslint-disable-next-line react/jsx-key
              <Range>
                <RareSatRow item={item} />
                {i < satributes.length - 1 && <Divider $verticalMargin="s" />}
              </Range>
            ))}
          {bundleSize && totalExoticSats !== bundleSize && (
            <>
              <Divider $verticalMargin="s" />
              <Range>
                <RareSatRow
                  item={{
                    types: ['COMMON'],
                    amount: bundleSize - totalExoticSats,
                    fromAddress: '',
                  }}
                />
              </Range>
            </>
          )}
        </RangesContainer>
      )}
    </SatsBundleContainer>
  );
}

export default RareSats;
