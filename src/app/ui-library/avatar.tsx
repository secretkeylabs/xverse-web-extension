import styled from 'styled-components';

type Props = {
  icon?: React.ReactNode;
  src?: React.ReactNode;
  size?: number;
};

const ImageContainer = styled.div<{ size: number }>((props) => ({
  height: props.size,
  width: props.size,
  borderRadius: '50%',
  backgroundColor: props.color,
  overflow: 'hidden',
}));

const IconContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  backgroundColor: props.theme.colors.white_0,
}));

export default function Avatar({ icon, src, size = 32 }: Props) {
  return (
    <ImageContainer size={size}>
      {icon && <IconContainer>{icon}</IconContainer>}
      {src && src}
    </ImageContainer>
  );
}
