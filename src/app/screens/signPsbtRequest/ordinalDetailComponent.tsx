import Eye from '@assets/img/createPassword/Eye.svg';
import { useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import Cross from '@assets/img/dashboard/X.svg';
import styled from 'styled-components';
import { Inscription } from '@secretkeylabs/xverse-core';
import OrdinalImage from '@screens/ordinals/ordinalImage';

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
  color: props.theme.colors.white[200],
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
  color: props.theme.colors.white[200],
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

const SubValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  fontSize: 12,
  color: props.theme.colors.white[400],
}));

const InscriptionText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  fontSize: 21,
  marginTop: 24,
  textAlign: 'center',
  color: props.theme.colors.white[0],
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
  ordinalInscription: string;
  ordinalDetail?: string;
  icon: string;
  title: string;
  heading?: string;
  ordinal?: Inscription;
}
function OrdinalDetailComponent({
  ordinalInscription,
  ordinalDetail,
  icon,
  title,
  heading,
  ordinal,
}: Props) {
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
              <OrdinalImage ordinal={ordinal!} />
            </OrdinalImageContainer>
            <InscriptionText>{`Inscription ${ordinal?.number} `}</InscriptionText>
          </OrdinalOuterImageContainer>
        </OrdinalBackgroundContainer>
      )}
      <Container>
        {heading && <RecipientTitleText>{heading}</RecipientTitleText>}
        <RowContainer>
          <Icon src={icon} />
          <TitleText>{title}</TitleText>
          <ColumnContainer>
            <RowContainer>
              <ValueText>{ordinalInscription}</ValueText>
              <TransparentButton onClick={onButtonClick}>
                <EyeIcon src={Eye} alt="show" />
              </TransparentButton>
            </RowContainer>
            {ordinalDetail && <SubValueText>{ordinalDetail}</SubValueText>}
          </ColumnContainer>
        </RowContainer>
      </Container>
    </>
  );
}

export default OrdinalDetailComponent;
