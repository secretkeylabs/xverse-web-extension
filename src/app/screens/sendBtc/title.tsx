import TokenImage from '@components/tokenImage';
import styled from 'styled-components';

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0;
`;

const TitleText = styled.div`
  ${(props) => props.theme.typography.headline_xs}
  margin-top: ${(props) => props.theme.spacing(6)}px;
  margin-bottom: ${(props) => props.theme.spacing(12)}px;
`;

type Props = {
  title: string;
  showBtcIcon?: boolean;
};

export default function Title({ title, showBtcIcon = false }: Props) {
  return (
    <TitleContainer>
      {showBtcIcon && <TokenImage currency="BTC" />}
      <TitleText>{title}</TitleText>
    </TitleContainer>
  );
}
