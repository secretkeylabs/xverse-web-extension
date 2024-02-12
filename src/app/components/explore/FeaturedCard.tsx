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
  padding: 16px;
  ${({ theme }) => theme.typography.body_medium_m};
`;

export interface FeaturedCardProps {
  link: string;
  src: string;
  text: string;
}

function FeaturedCard({ link, src, text }: FeaturedCardProps) {
  return (
    <Card to={link} target="_blank">
      <CardImage src={src} />
      <CardText>{text}</CardText>
    </Card>
  );
}

export default FeaturedCard;
