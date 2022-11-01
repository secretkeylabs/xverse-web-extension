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
  paddingTop: props.theme.spacing(12),
}));

const ComponentText = styled.h1<TitleProps>((props) => ({
  ...props.theme.body_m,
  paddingTop: props.theme.spacing(8),
  paddingBottom: props.theme.spacing(8),
  color: props.textColor,
  flex: 1,
  textAlign: 'left',
}));

const ComponentDescriptionText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  paddingTop: props.theme.spacing(8),
  paddingBottom: props.theme.spacing(8),
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
  const showTitle = <TitleText>{title}</TitleText>;

  const showDescriptionText = <ComponentDescriptionText>{textDetail}</ComponentDescriptionText>;

  const showIcon = <img src={icon} alt="arrow icon" />;
  return (
    <ColumnContainer>
      {title && showTitle}
      <Button
        onClick={onClick}
        border={showDivider ? `1px solid ${theme.colors.background.elevation3}` : 'transparent'}
      >
        <ComponentText
          textColor={showWarningTitle ? theme.colors.feedback.error : theme.colors.white['200']}
        >
          {text}
        </ComponentText>
        {textDetail && showDescriptionText}
        {icon && showIcon}
      </Button>
    </ColumnContainer>
  );
}

export default SettingComponent;
