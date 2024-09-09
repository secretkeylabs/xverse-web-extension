import { CaretLeft, CaretRight, XCircle } from '@phosphor-icons/react';
import type { NotificationBanner } from '@secretkeylabs/xverse-core';
import { setNotificationBannersAction } from '@stores/wallet/actions/actionCreators';
import { CrossButton } from '@ui-library/sheet';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import 'swiper/css';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Theme from 'theme';
import Banner from './banner';

const CarouselContainer = styled.div`
  position: relative;
  margin-top: ${({ theme }) => theme.space.xxs};
  margin-bottom: ${({ theme }) => theme.space.xxs};

  .swiper {
    padding: 0;
    z-index: 0;
  }

  .swiper-wrapper {
    align-items: center;
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

const Button = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: transparent;
  width: 18px;
  height: 18px;
  z-index: 1;

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

  &.swiper-button-next {
    right: -6px;
  }

  &.swiper-button-prev {
    left: -8px;
  }
`;

const PaginationContainer = styled.div`
  margin-bottom: -40px;
  z-index: 1;
`;

const StyledCrossButton = styled(CrossButton)`
  z-index: 1;
  position: absolute;
  top: -8px;
  right: -6px;
`;

type Props = {
  items: NotificationBanner[];
};

function BannerCarousel({ items }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dispatch = useDispatch();

  const dismissBanner = () => {
    dispatch(setNotificationBannersAction({ id: items[activeIndex].id, isDismissed: true }));
  };

  return (
    <CarouselContainer>
      <StyledCrossButton onClick={dismissBanner}>
        <XCircle size={24} weight="fill" color={Theme.colors.white_200} />
      </StyledCrossButton>
      <Swiper
        slidesPerView="auto"
        spaceBetween={16}
        pagination={{ clickable: true, el: '.swiper-pagination' }}
        modules={[Pagination, Navigation]}
        navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
        }}
        allowTouchMove
      >
        {items.map((item) => (
          <SwiperSlide data-testid="app-slide" key={item.id}>
            <Banner {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
      {items.length > 1 && (
        <>
          <Button className="swiper-button-prev">
            <CaretLeft size={18} />
          </Button>
          <Button className="swiper-button-next">
            <CaretRight size={18} />
          </Button>
        </>
      )}
      <PaginationContainer className="swiper-pagination" />
    </CarouselContainer>
  );
}

export default BannerCarousel;
