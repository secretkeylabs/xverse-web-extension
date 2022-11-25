import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ArrowSquareOut from '@assets/img/arrow_square_out.svg';
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

const AssociatedAddressText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(2),
  wordBreak: 'break-all',
  color: props.theme.colors.white['400'],
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
        {bnsName ? <AssociatedAddressText>{recipient}</AssociatedAddressText> : <ValueText>{recipient}</ValueText>}
        <ActionButton onClick={handleOnPress}>
          <ButtonImage src={ArrowSquareOut} />
        </ActionButton>
      </RowContainer>
    </InfoContainer>
  );
}

export default RecipientAddressView;
