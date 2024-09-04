import styled from 'styled-components';
import 'swiper/css';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import FeaturedCard, { type FeaturedCardProps } from './FeaturedCard';

const CarouselContainer = styled.div`
  margin-top: ${({ theme }) => theme.space.l};
  margin-bottom: ${({ theme }) => theme.space.xl};

  .swiper {
    padding-bottom: 35px;
  }

  .swiper-slide {
    width: fit-content !important;
  }

  .swiper-pagination {
    position: absolute;
    bottom: 0px;
  }

  .swiper-pagination-bullet {
    width: 6px;
    height: 6px;
    background: ${(props) => props.theme.colors.white_600};
    opacity: 1;
    border-radius: 50px;
    transition: width 0.2s ease, background 0.1s ease;
  }

  .swiper-pagination-bullet-active {
    width: 18px;
    background: ${(props) => props.theme.colors.white_0};
  }
`;

type FeaturedCardCarouselProps = {
  items: Array<FeaturedCardProps>;
};

function FeaturedCardCarousel({ items }: FeaturedCardCarouselProps) {
  return (
    <CarouselContainer data-testid="app-carousel">
      <Swiper
        slidesPerView="auto"
        spaceBetween={16}
        pagination={{ clickable: true }}
        modules={[Pagination, Navigation]}
        navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
        allowTouchMove
      >
        {items.map((item) => (
          <SwiperSlide data-testid="app-slide" key={item.url}>
            <FeaturedCard {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </CarouselContainer>
  );
}

export default FeaturedCardCarousel;
