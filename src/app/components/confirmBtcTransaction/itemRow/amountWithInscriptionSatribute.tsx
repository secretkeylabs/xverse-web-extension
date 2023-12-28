import DropDownIcon from '@assets/img/transactions/dropDownIcon.svg';
import BundleItem from '@components/confirmBtcTransactionComponent/bundleItem';
import useWalletSelector from '@hooks/useWalletSelector';
import { WarningOctagon } from '@phosphor-icons/react';
import { animated, config, useSpring } from '@react-spring/web';
import { btcTransaction, BundleSatRange } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Divider from '@ui-library/divider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';
import { mapTxSatributeInfoToBundleInfo } from '../utils';
import Inscription from './inscription';

const WarningContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${(props) => props.theme.space.s};
`;

const WarningButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colors.elevation1};
  padding-top: ${(props) => props.theme.space.m};
`;

const ItemsContainer = styled(animated.div)((props) => ({
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

const Title = styled(StyledP)`
  margin-left: ${(props) => props.theme.space.xxs};
`;

export default function AmountWithInscriptionSatribute({
  satributes,
  inscriptions,
  onShowInscription,
}: {
  satributes: btcTransaction.IOSatribute[];
  inscriptions: btcTransaction.IOInscription[];
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
}) {
  const [showBundleDetail, setShowBundleDetail] = useState(false);

  const { t } = useTranslation('translation');
  const { hasActivatedRareSatsKey } = useWalletSelector();

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

  // we only show the satributes if the user has activated the rare sats key
  const satributesArray = hasActivatedRareSatsKey ? satributes : [];
  const amountOfAssets = satributesArray.length + inscriptions.length;

  return amountOfAssets > 0 ? (
    <WarningContainer>
      <WarningButton type="button" onClick={() => setShowBundleDetail((prevState) => !prevState)}>
        <Row>
          <WarningOctagon weight="fill" color={Theme.colors.caution} />
          <Title typography="body_medium_s" color="caution">
            {t(
              `CONFIRM_TRANSACTION.${
                satributesArray.length ? 'INSCRIBED_RARE_SATS' : 'INSCRIBED_SATS'
              }`,
            )}
          </Title>
        </Row>
        <animated.img style={arrowRotation} src={DropDownIcon} alt="Drop Down" />
      </WarningButton>

      {showBundleDetail && (
        <ItemsContainer style={slideInStyles}>
          {inscriptions.map((item: btcTransaction.IOInscription, index: number) => (
            <div key={item.id}>
              <Range>
                <Inscription
                  inscription={item}
                  hideTypeSizeInfo
                  onShowInscription={onShowInscription}
                />
              </Range>
              {(satributesArray.length || inscriptions.length > index + 1) && (
                <Divider verticalMargin="s" />
              )}
            </div>
          ))}
          {satributesArray.map((item: btcTransaction.IOSatribute, index: number) => (
            <div key={item.offset}>
              <Range>
                <BundleItem item={mapTxSatributeInfoToBundleInfo(item)} />
              </Range>
              {satributesArray.length > index + 1 && <Divider verticalMargin="s" />}
            </div>
          ))}
        </ItemsContainer>
      )}
    </WarningContainer>
  ) : null;
}
