import Switch from 'react-switch';
import styled, { useTheme } from 'styled-components';

const CustomSwitch = styled(Switch)`
  .react-switch-handle {
    background-color: ${({ checked }) =>
      checked ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)'} !important;
    border: ${({ checked }) => (checked ? '' : '4px solid rgba(255, 255, 255, 0.2)')} !important;
  }
`;

const Button = styled.button<{
  border: string;
}>((props) => ({
  display: 'flex',
  alignItems: 'center',
  background: 'transparent',
  justifyContent: 'flex-start',
  paddingTop: props.theme.space.m,
  paddingBottom: props.theme.space.m,
  borderBottom: props.border,
}));

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const TitleText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_l,
  fontSize: 18,
  paddingBottom: props.theme.space.s,
  paddingTop: props.theme.space.xl,
}));

const ComponentText = styled.h1<{
  textColor: string;
}>((props) => ({
  ...props.theme.typography.body_m,
  color: props.textColor,
  flex: 1,
  textAlign: 'left',
}));

const ComponentDescriptionText = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
}));

const DescriptionText = styled.p((props) => ({
  ...props.theme.typography.body_m,
  marginTop: props.theme.space.xxs,
  color: props.theme.colors.white_400,
  textAlign: 'left',
  paddingRight: props.theme.space.m,
}));

const Column = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const DisabledOverlay = styled.div((props) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  backgroundColor: props.theme.colors.elevation0,
  opacity: 0.5,
}));

const Wrapper = styled.div({
  position: 'relative',
  display: 'inline-block', // This makes sure the wrapper size fits the content
});

interface SettingComponentProps {
  title?: string;
  text: string;
  textDetail?: string;
  onClick?: () => void;
  icon?: string;
  showDivider?: boolean;
  showWarningTitle?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  description?: string;
  disabled?: boolean;
  toggleFunction?: () => void;
}

function SettingComponent({
  title,
  text,
  textDetail,
  onClick,
  icon,
  showDivider,
  showWarningTitle,
  toggle,
  toggleValue,
  description,
  disabled,
  toggleFunction,
}: SettingComponentProps) {
  const theme = useTheme();

  return (
    <Wrapper>
      <ColumnContainer>
        {title && <TitleText>{title}</TitleText>}

        <Button
          onClick={onClick}
          border={showDivider ? `1px solid ${theme.colors.white_900}` : 'transparent'}
        >
          <Column>
            <ComponentText
              textColor={showWarningTitle ? theme.colors.feedback.error : theme.colors.white['200']}
            >
              {text}
            </ComponentText>
            {description && <DescriptionText>{description}</DescriptionText>}
          </Column>
          {textDetail && <ComponentDescriptionText>{textDetail}</ComponentDescriptionText>}
          {icon && <img src={icon} alt="arrow icon" />}
          {toggle && toggleFunction && (
            <CustomSwitch
              onColor={theme.colors.orange_main}
              offColor={theme.colors.elevation3}
              onChange={toggleFunction}
              checked={toggleValue ?? false}
              uncheckedIcon={false}
              checkedIcon={false}
            />
          )}
        </Button>
      </ColumnContainer>
      {disabled && <DisabledOverlay />}
    </Wrapper>
  );
}

export default SettingComponent;
