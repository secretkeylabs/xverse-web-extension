import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import styled from 'styled-components';

const TopSectionContainer = styled.div((props) => ({
  display: 'flex',
  minHeight: 18,
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(9),
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
    background: ${(props) => props.theme.colors.white_900};
    border-radius: 24px;
  }
  :focus {
    background: ${(props) => props.theme.colors.white_850};
    border-radius: 24px;
  }
`;

interface Props {
  title?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  showBackButton?: boolean;
  className?: string;
}

function TopRow({ title, onClick, showBackButton = true, className }: Props) {
  return (
    <TopSectionContainer className={className}>
      {showBackButton && (
        <AnimatedBackButton onClick={onClick}>
          <img src={ArrowLeft} alt="back button" />
        </AnimatedBackButton>
      )}
      <HeaderText>{title}</HeaderText>
    </TopSectionContainer>
  );
}

export default TopRow;
