import styled from 'styled-components';
import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';

const TopSectionContainer = styled.h1((props) => ({
  display: 'flex',
  marginTop: props.theme.spacing(11),
  marginLeft: props.theme.spacing(8),
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
}));

const HeaderText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  paddingRight: props.theme.spacing(10),
}));

const BackButton = styled.button({
  display: 'flex',
  justifyContent: 'flex-start',
  backgroundColor: 'transparent',
  padding: 5,
  position: 'absolute',
  left: 0,
});

const AnimatedBackButton = styled(BackButton)`
:hover {
  background: ${(props) => props.theme.colors.white[900]};
  border-radius: 24px;
}
:focus {
  background: ${(props) => props.theme.colors.white[850]};
  border-radius: 24px;
}
`;


interface Props {
  title: string;
  onClick: () => void;
}

function TopRow({ title, onClick }: Props) {
  return (
      <TopSectionContainer>
        <AnimatedBackButton onClick={onClick}>
          <img src={ArrowLeft} alt="back button" />
        </AnimatedBackButton>
        <HeaderText>{title}</HeaderText>
      </TopSectionContainer>
  );
}

export default TopRow;
