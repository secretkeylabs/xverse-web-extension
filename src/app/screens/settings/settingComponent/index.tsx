import styled, { useTheme } from 'styled-components';

interface ButtonProps {
  border: string;
}
interface TitleProps {
  textColor: string;
}

const Button = styled.button<ButtonProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  background: 'transparent',
  justifyContent: 'flex-start',
  marginTop: props.theme.spacing(6),
  paddingBottom: props.theme.spacing(8),
  borderBottom: props.border,
}));

const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  fontSize: 18,
  paddingBottom: props.theme.spacing(6),
  paddingTop: props.theme.spacing(16),
}));

const ComponentText = styled.h1<TitleProps>((props) => ({
  ...props.theme.body_m,
  paddingTop: props.theme.spacing(8),
  color: props.textColor,
  flex: 1,
  textAlign: 'left',
}));

const ComponentDescriptionText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  paddingTop: props.theme.spacing(8),
  color: props.theme.colors.white['0'],
}));

interface SettingComponentProps {
  title?: string;
  text: string;
  textDetail?: string;
  onClick?: () => void;
  icon?: string;
  showDivider?: boolean;
  showWarningTitle?: boolean;
}

function SettingComponent({
  title,
  text,
  textDetail,
  onClick,
  icon,
  showDivider,
  showWarningTitle,
}: SettingComponentProps) {
  const theme = useTheme();

  return (
    <ColumnContainer>
      {title && <TitleText>{title}</TitleText>}
      <Button
        onClick={onClick}
        border={showDivider ? '1px solid rgb(76,81,135,0.3)' : 'transparent'}
      >
        <ComponentText
          textColor={showWarningTitle ? theme.colors.feedback.error : theme.colors.white['200']}
        >
          {text}
        </ComponentText>
        {textDetail && <ComponentDescriptionText>{textDetail}</ComponentDescriptionText>}
        {icon && <img src={icon} alt="arrow icon" />}
      </Button>
    </ColumnContainer>
  );
}

export default SettingComponent;
