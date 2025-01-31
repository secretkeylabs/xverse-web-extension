import keystoneIcon from '@assets/img/hw/keystone/keystone_icon.svg';
import ledgerIcon from '@assets/img/hw/ledger/ledger_icon.svg';
import TopRow from '@components/topRow';
import useWalletSelector from '@hooks/useWalletSelector';
import RedirectButton from '@screens/buy/redirectButton';
import { isInOptions } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${({ theme }) => theme.space.m};
  padding-top: ${({ theme }) => theme.space.xs};
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  margin-bottom: 22px;
`;

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  marginBottom: props.theme.space.m,
}));

const Subtitle = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.l,
}));

export default function ConnectHardwareWallet() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { network } = useWalletSelector();

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const onImportLedgerAccount = async () => {
    if (isInOptions()) {
      navigate('/import-ledger');
    } else {
      await chrome.tabs.create({
        url: chrome.runtime.getURL('options.html#/import-ledger'),
      });
    }
  };

  const onImportKeystoneAccount = async () => {
    if (isInOptions()) {
      navigate('/import-keystone');
    } else {
      await chrome.tabs.create({
        url: chrome.runtime.getURL('options.html#/import-keystone'),
      });
    }
  };

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <Title>{t('CONNECT_HARDWARE_WALLET.TITLE')}</Title>
        <Subtitle>{t('CONNECT_HARDWARE_WALLET.SUBTITLE')}</Subtitle>
        <RedirectButton
          onClick={onImportLedgerAccount}
          text={t('CONNECT_HARDWARE_WALLET.CONNECT_LEDGER')}
          src={ledgerIcon}
          titleTypography="body_bold_m"
        />
        {network.type === 'Mainnet' && (
          <RedirectButton
            onClick={onImportKeystoneAccount}
            text={t('CONNECT_HARDWARE_WALLET.CONNECT_KEYSTONE')}
            src={keystoneIcon}
            titleTypography="body_bold_m"
          />
        )}
      </Container>
    </>
  );
}
