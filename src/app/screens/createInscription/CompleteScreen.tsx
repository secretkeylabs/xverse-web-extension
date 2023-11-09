import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ArrowSquareOut from '@assets/img/arrow_square_out.svg';
import Success from '@assets/img/send/check_circle.svg';

import ActionButton from '@components/button';
import CopyButton from '@components/copyButton';
import type { SettingsNetwork } from '@secretkeylabs/xverse-core/types';
import { getBtcTxStatusUrl } from '@utils/helper';

const TxStatusContainer = styled.div({
  background: 'rgba(25, 25, 48, 0.74)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backdropFilter: 'blur(16px)',
});

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const OuterContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginTop: props.theme.spacing(46),
  flex: 1,
}));

const TransactionIDContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginTop: props.theme.spacing(15),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ButtonContainer = styled.div((props) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: props.theme.spacing(6),
  marginTop: props.theme.spacing(15),
  marginBottom: props.theme.spacing(32),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(16),
}));

const TxIDContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

const CopyButtonContainer = styled.div({
  marginLeft: 8,
  padding: 2,
});

const InfoMessageContainer = styled.div({
  marginLeft: 8,
  marginRight: 8,
  marginTop: 20,
});

const Image = styled.img({
  alignSelf: 'center',
  transform: 'all',
});

const HeadingText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
  marginTop: props.theme.spacing(8),
}));

const BodyText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
  marginTop: props.theme.spacing(8),
  textAlign: 'center',
  overflowWrap: 'break-word',
  wordWrap: 'break-word',
  wordBreak: 'break-word',
  marginLeft: props.theme.spacing(5),
  marginRight: props.theme.spacing(5),
}));

const TxIDText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  marginTop: props.theme.spacing(8),
  textTransform: 'uppercase',
}));

const BeforeButtonText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
}));

const IDText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['0'],
  marginTop: props.theme.spacing(2),
  wordBreak: 'break-all',
}));

const ButtonText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginRight: props.theme.spacing(2),
  color: props.theme.colors.white['0'],
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: 'transparent',
  marginLeft: props.theme.spacing(3),
}));

type Props = {
  txId: string;
  onClose: () => void;
  network: SettingsNetwork;
};

function CompleteScreen({ txId, onClose, network }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'INSCRIPTION_REQUEST.COMPLETE' });

  const openTransactionInBrowser = () => {
    window.open(getBtcTxStatusUrl(txId, network), '_blank', 'noopener,noreferrer');
  };

  return (
    <TxStatusContainer>
      <OuterContainer>
        <Container>
          <Image src={Success} />
          <HeadingText>{t('INSCRIBED')}</HeadingText>
          <BodyText>{t('MESSAGE')}</BodyText>
        </Container>
        <RowContainer>
          <BeforeButtonText>{t('SEE_ON')}</BeforeButtonText>
          <Button onClick={openTransactionInBrowser}>
            <ButtonText>{t('BITCOIN_EXPLORER')}</ButtonText>
            <ButtonImage src={ArrowSquareOut} />
          </Button>
        </RowContainer>
        <TransactionIDContainer>
          <TxIDText>{t('TRANSACTION_ID')}</TxIDText>
          <TxIDContainer>
            <IDText>{txId}</IDText>
            <CopyButtonContainer>
              <CopyButton text={txId} />
            </CopyButtonContainer>
          </TxIDContainer>
        </TransactionIDContainer>
      </OuterContainer>
      <ButtonContainer>
        <ActionButton text={t('CLOSE')} onPress={onClose} />
      </ButtonContainer>
    </TxStatusContainer>
  );
}

export default CompleteScreen;
