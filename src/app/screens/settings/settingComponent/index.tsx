import Seperator from '@components/seperator';
import styled from 'styled-components';

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'space-between',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(11),
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

const ComponentText = styled.h1((props) => ({
  ...props.theme.body_m,
  paddingTop: props.theme.spacing(8),
  paddingBottom: props.theme.spacing(8),
  flex: 1,
}));

const ComponentDescriptionText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  paddingTop: props.theme.spacing(8),
  paddingBottom: props.theme.spacing(8),
}));

interface SettingComponentProps {
  title?: string;
  text: string;
  textDetail?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  showDivider?: boolean;
}

function SettingComponent({
  title,
  text,
  textDetail,
  onClick,
  icon,
  showDivider,
}: SettingComponentProps) {
  const showTitle = (
    <TitleText>
      {title}
    </TitleText>
  );

  const showDescriptionText = (
    <ComponentDescriptionText>{textDetail}</ComponentDescriptionText>
  );
  return (
    <ColumnContainer>
      {title && showTitle}
      <RowContainer>
        <ComponentText>{text}</ComponentText>
        {textDetail && showDescriptionText}
      </RowContainer>
      {showDivider && <Seperator />}
    </ColumnContainer>

  );
}

export default SettingComponent;
