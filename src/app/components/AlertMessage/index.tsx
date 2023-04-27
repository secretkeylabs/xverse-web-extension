import styled from 'styled-components';
import Cross from '@assets/img/dashboard/X.svg';
import ActionButton from '@components/button';

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
  background: props.theme.colors.background.elevation3,
  filter: 'drop-shadow(0px 16px 36px rgba(0, 0, 0, 0.5))',
}));

const HeaderText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  fontSize: 16,
  flex: 1,
}));

const DescriptionText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
  margin: 16,
  fontSize: 16,
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  padding: '20px 16px 16px 16px',
  alignItems: 'space-between',
  borderBottom: `1px solid ${props.theme.colors.background.elevation6}`,
}));

const TickMarkButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(18),
}));

const TickMarkButtonText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[0],
  marginLeft: props.theme.spacing(4.25),
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(6),
  width: '100%',
}));

const ButtonImage = styled.button({
  backgroundColor: 'transparent',
});

const TickButton = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  border: 1.3px solid #ffffff;
  width: 12px;
  height: 12px;

  &:checked {
    position: relative;
    &::before {
      content: '\\2713';
      font-size: 10px;
      color: #fff;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  &:hover {
    background-color: #303354;
  }
`;

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: props.theme.spacing(12),
  marginTop: props.theme.spacing(4),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

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
  buttonText?: string;
  secondButtonText?: string;
  isWarningAlert?: boolean;
  tickMarkButtonText?: string;
  onButtonClick?: () => void;
  onSecondButtonClick?: () => void;
  tickMarkButtonClick?:() => void;

}

function AlertMessage({
  onClose, title, description, buttonText, secondButtonText, tickMarkButtonText, isWarningAlert, onButtonClick, onSecondButtonClick, tickMarkButtonClick,
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
            <ActionButton
              text={buttonText ?? 'No'}
              transparent
              onPress={onButtonClick}
            />
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
          <ActionButton
            text={buttonText ?? 'Yes'}
            onPress={onButtonClick}
          />
        </ButtonContainer>
        )}
        { tickMarkButtonText && tickMarkButtonClick && (
        <TickMarkButtonContainer>
          <TickButton
            type="checkbox"
            defaultChecked={false}
            onChange={() => {
              tickMarkButtonClick();
            }}
          />
          <TickMarkButtonText>{tickMarkButtonText}</TickMarkButtonText>
        </TickMarkButtonContainer>
        )}
      </Container>

    </>
  );
}

export default AlertMessage;
