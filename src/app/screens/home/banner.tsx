import { XCircle } from '@phosphor-icons/react';
import { NotificationBanner } from '@secretkeylabs/xverse-core';
import { setNotificationBannersAction } from '@stores/wallet/actions/actionCreators';
import { trackMixPanel } from '@utils/mixpanel';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import Theme from 'theme';

const Container = styled.div`
  position: relative;
  width: 100%;
  color: ${({ theme }) => theme.colors.white_0};
  padding-top: ${({ theme }) => theme.space.xxs};
  padding-bottom: ${({ theme }) => theme.space.m};
`;

const BannerContent = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  column-gap: ${({ theme }) => theme.space.m};
  padding-left: ${({ theme }) => theme.space.m};
  padding-right: ${({ theme }) => theme.space.m};
  transition: opacity 0.1s ease;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }
`;

const BannerImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
`;

const BannerTitle = styled.div`
  ${({ theme }) => theme.typography.body_bold_m};
`;

const BannerText = styled.div`
  ${({ theme }) => theme.typography.body_medium_m};
  color: ${({ theme }) => theme.colors.white_200};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CrossButton = styled.div`
  z-index: 1;
  cursor: pointer;
  position: absolute;
  top: -${(props) => props.theme.space.xs};
  right: -${(props) => props.theme.space.xxs};
  display: flex;
  transition: opacity 0.1s ease;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }
`;

function Banner({ id, name, url, icon, description }: NotificationBanner) {
  const dispatch = useDispatch();

  const dismissBanner = () => {
    dispatch(setNotificationBannersAction({ id, isDismissed: true }));
  };

  return (
    <Container>
      <CrossButton onClick={dismissBanner}>
        <XCircle size={24} weight="fill" color={Theme.colors.white_200} />
      </CrossButton>
      <BannerContent
        onClick={() => {
          trackMixPanel(
            'click_app',
            {
              link: url,
              source: 'web-extension',
            },
            { send_immediately: true },
            () => {
              window.open(url, '_blank');
            },
            'explore-app',
          );
        }}
      >
        <BannerImage src={icon} />
        <div>
          <BannerTitle>{name}</BannerTitle>
          <BannerText>{description}</BannerText>
        </div>
      </BannerContent>
    </Container>
  );
}

export default Banner;
