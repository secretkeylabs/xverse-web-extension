import styled from 'styled-components';
import 'swiper/css';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import FeaturedCard, { FeaturedCardProps } from './FeaturedCard';

const CarouselContainer = styled.div`
  margin-top: ${({ theme }) => theme.space.l};
  margin-bottom: ${({ theme }) => theme.space.xl};

  .swiper {
    padding-bottom: 35px;
  }

  // So silly that they don't have a native API for this
  .swiper-slide {
    width: fit-content !important;
  }

  .swiper-pagination {
    position: absolute;
    bottom: 0px;
  }

  .swiper-pagination-bullet {
    background: ${(props) => props.theme.colors.white_800};
  }

  .swiper-pagination-bullet-active {
    background: ${(props) => props.theme.colors.white_200};
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
