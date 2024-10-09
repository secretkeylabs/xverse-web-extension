import styled from 'styled-components';

const CardContainer = styled.button((props) => ({
  display: 'flex',
  gap: props.theme.space.s,
  justifyContent: 'flex-start',
  alignItems: 'center',
  padding: props.theme.spacing(7),
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  cursor: 'pointer',
  transition: 'background 0.1s ease, border 0.1s ease',
  textAlign: 'left',
  color: props.theme.colors.white_0,
  background: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(2),
  border: `1px solid ${
    props.className === 'checked' ? '#7383ff4d' : props.theme.colors.elevation1
  }`,
  userSelect: 'none',
}));

const CardIconContainer = styled.div((props) => ({
  display: 'flex',
  width: props.theme.spacing(24),
  justifyContent: 'flex-start',
  alignItems: 'center',
}));

const CardIcon = styled.img<{
  $squareIcon: boolean;
}>((props) => ({
  width: props.$squareIcon ? 24 : 'auto',
  height: props.$squareIcon ? 24 : 'auto',
}));

const CardTitle = styled.h3((props) => ({
  ...props.theme.typography.body_bold_m,
}));

const CardText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
}));

type Props = {
  icon: string;
  title: string;
  text: string;
  name: 'Bitcoin' | 'Stacks';
  isChecked: boolean;
  onClick: (selectedAsset: 'Bitcoin' | 'Stacks') => void;
  squareIcon?: boolean;
};

function LedgerAssetSelectCard({
  icon,
  title,
  text,
  name,
  isChecked,
  onClick: handleClick,
  squareIcon = false,
}: Props) {
  return (
    <CardContainer className={isChecked ? 'checked' : ''} onClick={() => handleClick(name)}>
      <CardIconContainer>
        <CardIcon src={icon} alt={`${title} icon`} $squareIcon={squareIcon} />
      </CardIconContainer>
      <div>
        <CardTitle>{title}</CardTitle>
        <CardText>{text}</CardText>
      </div>
    </CardContainer>
  );
}

export default LedgerAssetSelectCard;
