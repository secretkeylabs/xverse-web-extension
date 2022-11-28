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
  backgroundColor: 'transparent',
  height: 44,
});

const ButtonImage = styled.img({
  alignSelf: 'center',
  transform: 'all',
});

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: props.theme.spacing(11),
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
      <BackButton onClick={onClick}>
        <ButtonImage src={ArrowLeft} />
      </BackButton>
      <TopSectionContainer>
        <HeaderText>{title}</HeaderText>
      </TopSectionContainer>
    </RowContainer>
  );
}

export default TopRow;
