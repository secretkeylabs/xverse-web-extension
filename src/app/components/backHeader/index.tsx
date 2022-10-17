import styled from 'styled-components';
import ArrowLeft from '@assets/img/arrow_left.svg';

const Container = styled.div((props) => ({
  display: 'flex',
  height: 62,
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const HeaderContent = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const HeaderTitle = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  textAlign: 'center',
}));

const Filler = styled.div({
  display: 'flex',
  flex: 0.5,
});

interface BackHeaderProps {
  headerText: string;
  onPressBack: () => void;
}

function BackHeader(props: BackHeaderProps): JSX.Element {
  const { headerText, onPressBack } = props;
  return (
    <Container>
      <HeaderContent>
        <button type="button" onClick={onPressBack} style={{ background: 'none' }}>
          <img alt="back" src={ArrowLeft} />
        </button>
        <HeaderTitle>{headerText}</HeaderTitle>
      </HeaderContent>
      <Filler />
    </Container>
  );
}
export default BackHeader;
