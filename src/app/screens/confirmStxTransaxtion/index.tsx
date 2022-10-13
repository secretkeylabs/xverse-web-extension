import ConfirmTransation from '@components/confirmTransaction';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { useNavigate } from 'react-router-dom';
import ArrowSquareOut from '@assets/img/send/arrow_square_out.svg';
import Seperator from '@components/seperator';

const InfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent:'center',
  alignItems:'center'
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(2),
  wordBreak:'break-all'
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

function ConfirmStxTransaction({}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const navigate = useNavigate();
  const recepientAddress = 'SPJW1XE278YMCEYMXB8ZFGJMH8ZVAAEDP2S2PJYG';
  const network = 'Mainnet';
  const memo = 'STX refund';
  function renderAddressInfoSection() {
    return (
      <InfoContainer>
        <TitleText>{t('RECEPIENT_ADDRESS')}</TitleText>
        <RowContainer>
        <ValueText>{recepientAddress}</ValueText>
        <ActionButton>
          <ButtonImage src={ArrowSquareOut}/>
        </ActionButton>
        </RowContainer>
      
      </InfoContainer>
    );
  }

  function renderNetworkInfoSection() {
    return (
      <InfoContainer>
        <TitleText>{t('NETWORK')}</TitleText>
        <ValueText>{network}</ValueText>
      </InfoContainer>
    );
  }

  function renderMemoInfoSection() {
    return (
      <InfoContainer>
        <TitleText>{t('MEMO')}</TitleText>
        <ValueText>{memo}</ValueText>
      </InfoContainer>
    );
  }

  const handleOnConfirmClick = () => {
    navigate('/tx-status');
  };

  const handleOnCancelClick = () => {
    navigate('/send-stx');
  };
  return (
    <ConfirmTransation currency="STX" fee={new BigNumber(105)} onConfirmClick={handleOnConfirmClick} onCancelClick={handleOnCancelClick}>
      {renderAddressInfoSection()}
      {renderNetworkInfoSection()}
      <Seperator />
      {renderMemoInfoSection()}
      <Seperator />
    </ConfirmTransation>
  );
}
export default ConfirmStxTransaction;
