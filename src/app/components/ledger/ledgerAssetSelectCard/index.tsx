import styled from 'styled-components';

const CardContainer = styled.label((props) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: props.theme.spacing(6),
  justifyContent: 'flex-start',
  padding: '14px 16px',
  cursor: 'pointer',
  background:
    props.className === 'checked' ? props.theme.colors.background.selectBackground : 'transparent',
  borderRadius: props.theme.radius(2),
  border: `1px solid ${
    props.className === 'checked' ? props.theme.colors.border.select : props.theme.colors.white[900]
  }`,
}));

const CardInput = styled.input((props) => ({
  display: 'none',
}));

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
  color: props.theme.colors.white[400],
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
