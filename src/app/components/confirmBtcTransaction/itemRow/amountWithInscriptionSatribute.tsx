import DropDownIcon from '@assets/img/transactions/dropDownIcon.svg';
import useWalletSelector from '@hooks/useWalletSelector';
import { WarningOctagon } from '@phosphor-icons/react';
import { animated, config, useSpring } from '@react-spring/web';
import { btcTransaction, type RareSatsType } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import Divider from '@ui-library/divider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';
import Inscription from './inscription';
import RareSatRow from './rareSatRow';
import RareSats from './rareSats';

const WarningContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.s};
`;

const WarningButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colors.elevation1};
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
  satributes: btcTransaction.IOSatribute[] | Omit<btcTransaction.IOSatribute, 'offset'>[];
  inscriptions:
    | btcTransaction.IOInscription[]
    | (btcTransaction.IOInscription & { satributes: RareSatsType[] })[]
    | (Omit<btcTransaction.IOInscription, 'offset'> & { satributes: RareSatsType[] })[];
  onShowInscription: (
    inscription:
      | (btcTransaction.IOInscription & { satributes: RareSatsType[] })
      | (Omit<btcTransaction.IOInscription, 'offset'> & { satributes: RareSatsType[] }),
  ) => void;
}) {
  const inscriptionsHaveSatributes = (
    inscriptionsArr: (
      | btcTransaction.IOInscription
      | (btcTransaction.IOInscription & { satributes: RareSatsType[] })
      | (Omit<btcTransaction.IOInscription, 'offset'> & { satributes: RareSatsType[] })
    )[],
  ): inscriptionsArr is (
    | (btcTransaction.IOInscription & { satributes: RareSatsType[] })
    | (Omit<btcTransaction.IOInscription, 'offset'> & { satributes: RareSatsType[] })
  )[] => inscriptions.some((inscription) => 'satributes' in inscription);

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

  const inscriptionSatributes =
    hasActivatedRareSatsKey && inscriptionsHaveSatributes(inscriptions)
      ? inscriptions
          .map((inscription) => inscription.satributes)
          .filter((rareSatsArr) => rareSatsArr.length > 0)
      : [];
  // we only show the satributes if the user has activated the rare sats key
  const satributesArray = hasActivatedRareSatsKey ? satributes : [];

  const amountOfAssets = satributesArray.length + inscriptions.length;

  if (amountOfAssets === 0) {
    return null;
  }

  return (
    <WarningContainer>
      <WarningButton type="button" onClick={() => setShowBundleDetail((prevState) => !prevState)}>
        <Row>
          <WarningOctagon weight="fill" color={Theme.colors.caution} size={16} />
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
          {inscriptions.map((item, index: number) => (
            <>
              <Range>
                <Inscription
                  inscription={item}
                  hideTypeSizeInfo
                  onShowInscription={onShowInscription}
                />
              </Range>
              {(inscriptionSatributes.length > 0 || inscriptions.length > index + 1) && (
                <Divider verticalMargin="s" />
              )}
            </>
          ))}
          {inscriptionSatributes.length > 0 && (
            <>
              <Range>
                <RareSats
                  buttonColor={Theme.colors.elevation2}
                  satributes={[]}
                  inscriptionSatributes={inscriptionSatributes}
                />
              </Range>
              {satributesArray.length > 0 && <Divider verticalMargin="s" />}
            </>
          )}
          {satributesArray.map(
            (
              item: btcTransaction.IOSatribute | Omit<btcTransaction.IOSatribute, 'offset'>,
              index: number,
            ) => (
              <>
                <Range>
                  <RareSatRow item={item} />
                </Range>
                {satributesArray.length > index + 1 && <Divider verticalMargin="s" />}
              </>
            ),
          )}
        </ItemsContainer>
      )}
    </WarningContainer>
  );
}
