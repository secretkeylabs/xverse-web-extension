import styled from 'styled-components';
import BarLoader from '@components/barLoader';
import { LoaderSize } from '@utils/constants';

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  color: props.theme.colors.white['400'],
}));

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: props.theme.spacing(16),
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  marginTop: props.theme.spacing(2),
  color: props.color ?? props.theme.colors.white['0'],
}));

const BarLoaderContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(5),
}));

interface Props {
  title: string;
  value: string | undefined;
  color?: string;
}

function StackingInfoTile({ title, value, color }: Props) {
  return (
    <Container>
      <TitleText>{title}</TitleText>
      {value ? (
        <ValueText color={color}>{value}</ValueText>
      ) : (
        <BarLoaderContainer>
          <BarLoader loaderSize={LoaderSize.LARGE} />
        </BarLoaderContainer>
      )}
    </Container>
  );
}

export default StackingInfoTile;
