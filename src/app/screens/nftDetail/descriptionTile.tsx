import styled from 'styled-components';

const DescriptionHeadingText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white_400,
  marginBottom: props.theme.spacing(2),
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
}));

const DescriptionValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(16),
}));

const ColumnContainer = styled.h1({
  display: 'flex',
  flexDirection: 'column',
});

interface Props {
  title: string;
  value: string;
}

function DescriptionTile({ title, value }: Props) {
  return (
    <ColumnContainer>
      <DescriptionHeadingText>{title}</DescriptionHeadingText>
      <DescriptionValueText>{value}</DescriptionValueText>
    </ColumnContainer>
  );
}

export default DescriptionTile;
