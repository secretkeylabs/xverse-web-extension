import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Card = styled(Link)`
  display: block;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.elevation2};
  height: 168px;
  width: 212px;
  color: ${({ theme }) => theme.colors.white_0};
`;

const CardImage = styled.img`
  border-radius: 12px 12px 0 0;
  width: 100%;
  height: auto;
  display: block;
`;

const CardText = styled.div`
  padding: ${({ theme }) => theme.space.m};
  ${({ theme }) => theme.typography.body_medium_m};
`;

export interface FeaturedCardProps {
  url: string;
  banner?: string;
  description: string;
}

function FeaturedCard({ url, banner, description }: FeaturedCardProps) {
  return (
    <Card to={url} target="_blank">
      <CardImage src={banner} />
      <CardText>{description}</CardText>
    </Card>
  );
}

export default FeaturedCard;
