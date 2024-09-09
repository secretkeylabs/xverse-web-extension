import { AnalyticsEvents, type NotificationBanner } from '@secretkeylabs/xverse-core';
import { trackMixPanel } from '@utils/mixpanel';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  width: 100%;
  color: ${({ theme }) => theme.colors.white_0};
`;

const BannerContent = styled.button`
  cursor: pointer;
  width: 100%;
  min-height: 60px;
  display: flex;
  align-items: center;
  column-gap: ${({ theme }) => theme.space.s};
  padding-left: ${({ theme }) => theme.space.m};
  padding-right: ${({ theme }) => theme.space.m};
  color: ${({ theme }) => theme.colors.white_0};
  background-color: transparent;
  text-align: left;
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

function Banner({ name, url, icon, description }: NotificationBanner) {
  return (
    <Container>
      <BannerContent
        onClick={() => {
          trackMixPanel(
            AnalyticsEvents.ClickApp,
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
