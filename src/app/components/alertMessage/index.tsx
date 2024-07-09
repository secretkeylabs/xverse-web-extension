import Cross from '@assets/img/dashboard/X.svg';
import ActionButton from '@components/button';
import Checkbox from '@ui-library/checkbox';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: 312,
  borderRadius: 12,
  zIndex: 16000,
  background: props.theme.colors.elevation3,
  filter: 'drop-shadow(0px 16px 36px rgba(0, 0, 0, 0.5))',
}));

const HeaderText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  fontSize: 16,
  flex: 1,
}));

const DescriptionText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  margin: props.theme.space.m,
  fontSize: 16,
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  padding: props.theme.space.m,
  paddingTop: 20,
  alignItems: 'space-between',
  borderBottom: `1px solid ${props.theme.colors.elevation6}`,
}));

const TickMarkButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.space.m,
  marginRight: props.theme.space.m,
  marginBottom: props.theme.spacing(18),
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginRight: props.theme.space.s,
  width: '100%',
}));

const ButtonImage = styled.button({
  backgroundColor: 'transparent',
});

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: props.theme.spacing(12),
  marginTop: props.theme.space.xs,
  marginLeft: props.theme.space.m,
  marginRight: props.theme.space.m,
}));

const OuterContainer = styled.div((props) => ({
  margin: 'auto',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed',
  backgroundColor: props.theme.colors.elevation0,
  zIndex: 1000,
  opacity: 0.6,
}));

interface Props {
  onClose: () => void;
  title: string;
  description: string;
  buttonText?: string;
  secondButtonText?: string;
  isWarningAlert?: boolean;
  tickMarkButtonText?: string;
  onButtonClick?: () => void;
  onSecondButtonClick?: () => void;
  tickMarkButtonClick?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tickMarkButtonChecked?: boolean;
}

function AlertMessage({
  onClose,
  title,
  description,
  buttonText,
  secondButtonText,
  tickMarkButtonText,
  isWarningAlert,
  onButtonClick,
  onSecondButtonClick,
  tickMarkButtonClick,
  tickMarkButtonChecked,
}: Props) {
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
        {onSecondButtonClick && onButtonClick && (
          <ButtonContainer>
            <TransparentButtonContainer>
              <ActionButton text={buttonText ?? 'No'} transparent onPress={onButtonClick} />
            </TransparentButtonContainer>
            <ActionButton
              text={secondButtonText ?? 'Yes'}
              onPress={onSecondButtonClick}
              warning={isWarningAlert}
            />
          </ButtonContainer>
        )}
        {!onSecondButtonClick && onButtonClick && (
          <ButtonContainer>
            <ActionButton text={buttonText ?? 'Yes'} onPress={onButtonClick} />
          </ButtonContainer>
        )}
        {tickMarkButtonText && tickMarkButtonClick && (
          <TickMarkButtonContainer>
            <Checkbox
              checkboxId={`${title}-ticker`}
              text={tickMarkButtonText}
              onChange={tickMarkButtonClick}
              checked={tickMarkButtonChecked}
            />
          </TickMarkButtonContainer>
        )}
      </Container>
    </>
  );
}

export default AlertMessage;
