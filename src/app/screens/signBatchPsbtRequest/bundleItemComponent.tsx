import Eye from '@assets/img/createPassword/Eye.svg';
import Cross from '@assets/img/dashboard/X.svg';
import IconOrdinal from '@assets/img/transactions/ordinal.svg';
import RareSatAsset from '@components/rareSatAsset/rareSatAsset';
import { animated, useSpring } from '@react-spring/web';
import { getTruncatedAddress } from '@utils/helper';
import { BundleItem, getBundleItemSubText } from '@utils/rareSats';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: '16px 16px',
  justifyContent: 'center',
  marginBottom: 12,
}));

const RecipientTitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
  marginBottom: 10,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const TransparentButton = styled.button({
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  marginLeft: 10,
});

const Icon = styled.img((props) => ({
  marginRight: props.theme.spacing(4),
  width: 32,
  height: 32,
  borderRadius: 30,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
}));

const SubValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  fontSize: 12,
  color: props.theme.colors.white_400,
}));

const InscriptionText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  fontSize: 21,
  marginTop: 24,
  textAlign: 'center',
  color: props.theme.colors.white[0],
  overflowWrap: 'break-word',
  wordWrap: 'break-word',
  wordBreak: 'break-word',
}));

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  marginTop: 12,
});

const CrossContainer = styled.div({
  display: 'flex',
  marginTop: 10,
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
});

const OrdinalOuterImageContainer = styled.div({
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 2,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const OrdinalImageContainer = styled.div({
  width: '50%',
});

const OrdinalBackgroundContainer = styled(animated.div)({
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed',
  zIndex: 10,
  background: 'rgba(18, 21, 30, 0.8)',
  backdropFilter: 'blur(16px)',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
});

const EyeIcon = styled.img({
  width: 20,
  height: 20,
});

interface Props {
  item: BundleItem;
  userReceivesOrdinal: boolean;
}
function BundleItemComponent({ item, userReceivesOrdinal }: Props) {
  const { t } = useTranslation('translation');
  const [showOrdinal, setShowOrdinal] = useState(false);
  const styles = useSpring({
    from: {
      opacity: 0,
      y: 24,
    },
    to: {
      y: 0,
      opacity: 1,
    },
    delay: 100,
  });
  const onButtonClick = () => {
    setShowOrdinal(true);
  };

  const onCrossClick = () => {
    setShowOrdinal(false);
  };
  const getItemId = () => {
    if (item.type === 'inscription') {
      return item.inscription.id;
    }
    if (item.type === 'inscribed-sat' || item.type === 'rare-sat') {
      return item.number;
    }
    return '';
  };
  const itemSubText = getBundleItemSubText({
    satType: item.type,
    rareSatsType: item.rarity_ranking,
  });
  const getDetail = () => {
    if (item.type === 'inscription' || item.type === 'inscribed-sat') {
      return item.inscription.content_type;
    }
    return itemSubText;
  };
  const getTitle = () => {
    if (item.type === 'inscription') {
      return t('COMMON.INSCRIPTION');
    }
    if (item.type === 'inscribed-sat') {
      return t('RARE_SATS.INSCRIBED_SAT');
    }
    return t('RARE_SATS.RARE_SAT');
  };
  return (
    <>
      {showOrdinal && (
        <OrdinalBackgroundContainer style={styles}>
          <CrossContainer onClick={onCrossClick}>
            <TransparentButton>
              <img src={Cross} alt="cross" />
            </TransparentButton>
          </CrossContainer>
          <OrdinalOuterImageContainer>
            <OrdinalImageContainer>
              <RareSatAsset item={item} />
            </OrdinalImageContainer>
            <InscriptionText>{`${getTitle()} ${getItemId()} `}</InscriptionText>
          </OrdinalOuterImageContainer>
        </OrdinalBackgroundContainer>
      )}
      <Container>
        <RecipientTitleText>
          {userReceivesOrdinal
            ? t('CONFIRM_TRANSACTION.YOU_WILL_RECEIVE')
            : t('CONFIRM_TRANSACTION.YOU_WILL_TRANSFER')}
        </RecipientTitleText>
        <RowContainer>
          <Icon src={IconOrdinal} />
          <TitleText>{getTitle()}</TitleText>
          <ColumnContainer>
            <RowContainer>
              <ValueText>{getTruncatedAddress(String(getItemId()))}</ValueText>
              <TransparentButton onClick={onButtonClick}>
                <EyeIcon src={Eye} alt="show" />
              </TransparentButton>
            </RowContainer>
            <SubValueText>{getDetail()}</SubValueText>
          </ColumnContainer>
        </RowContainer>
      </Container>
    </>
  );
}

export default BundleItemComponent;
