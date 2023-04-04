import styled from 'styled-components';

const RowContainer = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: transparent;
  justify-content: center;
  padding: 8px;
  :hover {
    opacity: 0.8;
  }
  :active {
    opacity: 0.6;
  }
`;

interface ImgContainerProps {
  color: string;
}

const ImgContainer = styled.div<ImgContainerProps>((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: props.color,
  width: 32,
  height: 32,
  borderRadius: 25,
  padding: props.theme.spacing(6),
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
  marginLeft: props.theme.spacing(6),
}));

interface Props {
  img: string;
  text: string;
  background: string;
  onClick?: () => void;
}

function ShareLinkRow({ img, text, background, onClick }: Props) {
  return (
    <RowContainer onClick={onClick}>
      <ImgContainer color={background}>
        <img src={img} alt="option" />
      </ImgContainer>
      <Text>{text}</Text>
    </RowContainer>
  );
}

export default ShareLinkRow;
