import styled from 'styled-components';

const CardContainer = styled.label((props) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: props.theme.spacing(6),
  justifyContent: 'flex-start',
  padding: props.theme.spacing(7),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  cursor: 'pointer',
  transition: 'background 0.2s ease, border 0.2s ease',
  background:
    props.className === 'checked' ? props.theme.colors.background.selectBackground : 'transparent',
  borderRadius: props.theme.radius(2),
  border: `1px solid ${
    props.className === 'checked' ? props.theme.colors.border.select : props.theme.colors.white_900
  }`,
  userSelect: 'none',
}));

const CardInput = styled.input({
  display: 'none',
});

const CardImageContainer = styled.div((props) => ({
  display: 'flex',
  width: props.theme.spacing(24),
  justifyContent: 'flex-start',
  alignItems: 'center',
}));

const CardTitle = styled.h3((props) => ({
  ...props.theme.body_bold_m,
}));

const CardText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_400,
}));

interface Props {
  icon: string;
  title: string;
  text: string;
  id: string;
  isChecked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function LedgerAssetSelectCard({
  icon,
  title,
  text,
  id,
  isChecked,
  onChange: handleChange,
}: Props) {
  return (
    <div>
      <CardContainer htmlFor={id} className={isChecked ? 'checked' : ''}>
        <CardImageContainer>
          <img src={icon} alt={`${title} icon`} />
        </CardImageContainer>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardText>{text}</CardText>
        </div>
      </CardContainer>
      <CardInput id={id} type="checkbox" checked={isChecked} onChange={handleChange} />
    </div>
  );
}

export default LedgerAssetSelectCard;
