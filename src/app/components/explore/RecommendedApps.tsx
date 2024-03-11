import { mixpanelInstanceExploreApp } from 'app/mixpanelSetup';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  margin-top: ${({ theme }) => theme.space.l};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.l};
  width: 100%;
`;

const Card = styled(Link)`
  display: flex;
  align-items: center;
  column-gap: ${({ theme }) => theme.space.m};
  width: 100%;
  max-width: 282px;
  color: ${({ theme }) => theme.colors.white_0};
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

type Props = { items: { url: string; icon: string; name: string; description: string }[] };

function RecommendedApps({ items }: Props) {
  return (
    <Container>
      {items.map((item) => (
        <Card
          onClick={() => {
            mixpanelInstanceExploreApp.track('click_app', {
              title: item.name,
              link: item.url,
              section: 'recommended',
              source: 'web-extension',
            });
          }}
          to={item.url}
          key={item.url}
          target="_blank"
        >
          <CardImage src={item.icon} />
          <div>
            <CardTitle>{item.name}</CardTitle>
            <CardText>{item.description}</CardText>
          </div>
        </Card>
      ))}
    </Container>
  );
}

export default RecommendedApps;
