import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const Button = styled.button`
  background-color: transparent;
  width: 18px;
  height: 18px;
  margin: 6px;

  svg {
    color: ${({ theme }) => theme.colors.white_0};
    transition: color 0.1s ease;
  }

  &:hover {
    svg {
      color: ${({ theme }) => theme.colors.white_200};
    }
  }

  &:disabled {
    cursor: default;
    svg {
      color: ${({ theme }) => theme.colors.white_600};
    }
  }
`;

function SwiperNavigation() {
  return (
    <Container>
      <Button className="swiper-button-prev">
        <CaretLeft size={18} />
      </Button>
      <Button className="swiper-button-next">
        <CaretRight size={18} />
      </Button>
    </Container>
  );
}

export default SwiperNavigation;
