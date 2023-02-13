import styled from 'styled-components';
import Cross from '@assets/img/dashboard/X.svg';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: 312,
  height: 137,
  borderRadius: 12,
  zIndex: 1000,
  background: props.theme.colors.background.elevation2,
  filter: 'drop-shadow(0px 16px 36px rgba(0, 0, 0, 0.5))',
}));

const HeaderText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  flex: 1,
}));

const DescriptionText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
  margin: 16,
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  padding: '20px 16px 16px 16px',
  alignItems: 'space-between',
  borderBottom: `1px solid ${props.theme.colors.background.elevation3}`,
}));

const ButtonImage = styled.button({
  backgroundColor: 'transparent',
});

const OuterContainer = styled.div((props) => ({
  margin: 'auto',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed',
  backgroundColor: props.theme.colors.background.elevation0,
  zIndex: 1000,
  opacity: 0.6,
}));

interface Props {
  onClose: () => void;
  title: string;
  description: string;
}

function AlertMessage({ onClose, title, description }: Props) {
  return (
    <>
      <OuterContainer />
      <Container>
        <RowContainer>
          <HeaderText>{title}</HeaderText>
          <ButtonImage onClick={onClose}>
            <img src={Cross} alt="cross" />
          </ButtonImage>
        </RowContainer>
        <DescriptionText>{description}</DescriptionText>
      </Container>

    </>
  );
}

export default AlertMessage;
