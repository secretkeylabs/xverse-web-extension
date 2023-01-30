import styled from 'styled-components';
import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';

const TopSectionContainer = styled.div({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
});

const HeaderText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  paddingRight: props.theme.spacing(10),
}));

const BackButton = styled.button({
  display: 'flex',
  justifyContent: 'flex-start',
  backgroundColor: 'transparent',
  padding: 5,
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

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  paddingTop: props.theme.spacing(11),
  alignItems: 'center',
  paddingLeft: '5%',
  paddingRight: '5%',
}));

interface Props {
  title: string;
  onClick: () => void;
}

function TopRow({ title, onClick }: Props) {
  return (
    <RowContainer>
      <AnimatedBackButton onClick={onClick}>
        <img src={ArrowLeft} alt="back button" />
      </AnimatedBackButton>
      <TopSectionContainer>
        <HeaderText>{title}</HeaderText>
      </TopSectionContainer>
    </RowContainer>
  );
}

export default TopRow;
