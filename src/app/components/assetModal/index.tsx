import Cross from '@assets/img/dashboard/X.svg';
import { animated, useSpring } from '@react-spring/web';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import { CondensedInscription } from '@secretkeylabs/xverse-core/types';
import { Inscription } from '@utils/rareSats';
import styled from 'styled-components';

const TransparentButton = styled.button({
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  marginLeft: 10,
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

interface Props {
  show: boolean;
  inscription: Inscription;
  onClose: () => void;
}

function AssetModal({ show, inscription, onClose }: Props) {
  const consdensedInscription: CondensedInscription = {
    ...inscription,
    number: inscription.inscription_number,
  };
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

  return (
    <OrdinalBackgroundContainer style={styles}>
      <CrossContainer onClick={onClose}>
        <TransparentButton>
          <img src={Cross} alt="cross" />
        </TransparentButton>
      </CrossContainer>
      <OrdinalOuterImageContainer>
        <OrdinalImageContainer>
          <OrdinalImage ordinal={consdensedInscription} />
        </OrdinalImageContainer>
      </OrdinalOuterImageContainer>
    </OrdinalBackgroundContainer>
  );
}

export default AssetModal;
