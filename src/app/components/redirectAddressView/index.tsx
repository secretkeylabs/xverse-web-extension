import styled from 'styled-components';
import GoToImage from '@assets/img/webInteractions/goto-explorer.svg';
import { getExplorerUrl } from '@utils/helper';

const InfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

const AddressContainer = styled.div({
  display: 'flex',
  flex: 1,
});

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(2),
  wordBreak: 'break-all',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  marginTop: props.theme.spacing(1),
}));

const ActionButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: 'transparent',
  marginLeft: props.theme.spacing(12),
}));

interface Props {
  recipient: string;
  title?: string;
}
function RedirectAddressView({ recipient, title }: Props) {
  const handleOnPress = () => {
    window.open(getExplorerUrl(recipient));
  };

  return (
    <InfoContainer>
      <TitleText>{title}</TitleText>
      <RowContainer>
        <AddressContainer>
          <ValueText>{recipient}</ValueText>
        </AddressContainer>
        <ActionButton onClick={handleOnPress}>
          <ButtonImage src={GoToImage} />
        </ActionButton>
      </RowContainer>
    </InfoContainer>
  );
}

export default RedirectAddressView;
