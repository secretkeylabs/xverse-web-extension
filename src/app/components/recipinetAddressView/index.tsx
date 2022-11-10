import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ArrowSquareOut from '@assets/img/send/arrow_square_out.svg';
import { getExplorerUrl } from '@utils/helper';
import { useBnsName } from '@hooks/useBnsName';
import useWalletSelector from '@hooks/useWalletSelector';

const InfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
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
  alignSelf: 'center',
  transform: 'all',
}));

const ActionButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  marginLeft: props.theme.spacing(12),
}));

interface Props {
  recipient: string;
}
function RecipientAddressView({ recipient }: Props) {
  const { network } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const bnsName = useBnsName(recipient, network);
  const handleOnPress = () => {
    window.open(getExplorerUrl(recipient));
  };

  return (
    <InfoContainer>
      <TitleText>{t('RECEPIENT_ADDRESS')}</TitleText>
      <ValueText>{bnsName}</ValueText>
      <RowContainer>
        <ValueText>{recipient}</ValueText>
        <ActionButton onClick={handleOnPress}>
          <ButtonImage src={ArrowSquareOut} />
        </ActionButton>
      </RowContainer>
    </InfoContainer>
  );
}

export default RecipientAddressView;
