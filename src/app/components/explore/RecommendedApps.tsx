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
`;

type Props = { items: { link: string; src: string; title: string; text: string }[] };

function RecommendedApps({ items }: Props) {
  return (
    <Container>
      {items.map((item) => (
        <Card to={item.link} key={item.title} target="_blank">
          <CardImage src={item.src} />
          <div>
            <CardTitle>{item.title}</CardTitle>
            <CardText>{item.text}</CardText>
          </div>
        </Card>
      ))}
    </Container>
  );
}

export default RecommendedApps;
