import { AnalyticsEvents } from '@secretkeylabs/xverse-core';
import { trackMixPanel } from '@utils/mixpanel';
import styled from 'styled-components';

const Container = styled.div`
  margin-top: ${({ theme }) => theme.space.l};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.l};
  width: 100%;
`;

const Card = styled.button`
  cursor: pointer;
  display: flex;
  align-items: center;
  column-gap: ${({ theme }) => theme.space.m};
  width: 100%;
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

const CardImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 12px;
`;

const CardTitle = styled.div`
  ${({ theme }) => theme.typography.body_bold_m};
`;

const CardText = styled.div`
  ${({ theme }) => theme.typography.body_medium_m};
  color: ${({ theme }) => theme.colors.white_400};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

type Props = {
  items: {
    url: string;
    icon: string;
    name: string;
    description: string;
  }[];
};

function RecommendedApps({ items }: Props) {
  return (
    <Container>
      {items.map((item) => (
        <Card
          data-testid="app-card"
          key={item.url}
          onClick={() => {
            trackMixPanel(
              AnalyticsEvents.ClickApp,
              {
                title: item.name,
                link: item.url,
                section: 'recommended',
                source: 'web-extension',
              },
              { send_immediately: true },
              () => {
                window.open(item.url, '_blank');
              },
              'explore-app',
            );
          }}
        >
          <CardImage src={item.icon} />
          <div>
            <CardTitle data-testid="app-title">{item.name}</CardTitle>
            <CardText>{item.description}</CardText>
          </div>
        </Card>
      ))}
    </Container>
  );
}

export default RecommendedApps;
