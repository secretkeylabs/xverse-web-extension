import ActionButton from '@components/button';
import { XCircle } from '@phosphor-icons/react';
import styled, { useTheme } from 'styled-components';

type DialogType = 'default' | 'feedback';

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
  padding: '16px 16px 32px 16px',
  background: props.theme.colors.elevation3,
  filter: 'drop-shadow(0px 16px 36px rgba(0, 0, 0, 0.5))',
}));

const HeaderText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  flex: 1,
}));

const CenteredTitle = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  textAlign: 'center',
  marginTop: props.theme.spacing(6),
}));

const DescriptionText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
  marginTop: props.theme.spacing(8),
}));

const DescriptionTextCenter = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
  marginTop: props.theme.spacing(2),
  textAlign: 'center',
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'space-between',
});

const TransparentButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(6),
  width: '100%',
}));

const ButtonImage = styled.button({
  backgroundColor: 'transparent',
});

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(16),
}));

const OuterContainer = styled.div((props) => ({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed',
  backgroundColor: props.theme.colors.elevation0,
  zIndex: 1000,
  opacity: 0.6,
}));

const Column = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(8),
  alignItems: 'center',
}));

interface Props {
  onClose: () => void;
  title: string;
  description: string;
  leftButtonText?: string;
  leftButtonDisabled?: boolean;
  rightButtonText?: string;
  rightButtonDisabled?: boolean;
  type?: DialogType;
  icon?: JSX.Element;
  onLeftButtonClick?: () => void;
  onRightButtonClick?: () => void;
}

// TODO: handle horizontal and vertical bottons view

function Dialog({
  onClose,
  title,
  description,
  leftButtonText,
  leftButtonDisabled,
  rightButtonText,
  rightButtonDisabled,
  type = 'default',
  icon,
  onLeftButtonClick,
  onRightButtonClick,
}: Props) {
  const theme = useTheme();
  return (
    <>
      <OuterContainer />
      <Container>
        <RowContainer>
          <HeaderText>{type === 'default' ? title : ''}</HeaderText>
          <ButtonImage onClick={onClose}>
            <XCircle size={24} color={theme.colors.white_200} weight="fill" />
          </ButtonImage>
        </RowContainer>
        {type === 'default' ? (
          <DescriptionText>{description}</DescriptionText>
        ) : (
          <Column>
            {icon}
            <CenteredTitle>{title}</CenteredTitle>
            <DescriptionTextCenter>{description}</DescriptionTextCenter>
          </Column>
        )}
        {onRightButtonClick && onLeftButtonClick && (
          <ButtonContainer>
            <TransparentButtonContainer>
              <ActionButton
                text={leftButtonText ?? 'No'}
                transparent
                onPress={onLeftButtonClick}
                disabled={leftButtonDisabled}
              />
            </TransparentButtonContainer>
            <ActionButton
              text={rightButtonText ?? 'Yes'}
              onPress={onRightButtonClick}
              disabled={rightButtonDisabled}
            />
          </ButtonContainer>
        )}
        {!onRightButtonClick && onLeftButtonClick && (
          <ButtonContainer>
            <ActionButton
              text={leftButtonText ?? 'Yes'}
              onPress={onLeftButtonClick}
              disabled={leftButtonDisabled}
            />
          </ButtonContainer>
        )}
      </Container>
    </>
  );
}

export default Dialog;
