import leatherLogo from '@assets/img/restoreWallet/leather_logo.svg';
import magicEdenLogo from '@assets/img/restoreWallet/magic_eden_logo.svg';
import okxLogo from '@assets/img/restoreWallet/okx_logo.svg';
import autoDetectLogo from '@assets/img/restoreWallet/other_logo.svg';
import phantomLogo from '@assets/img/restoreWallet/phantom_logo.svg';
import unisatLogo from '@assets/img/restoreWallet/unisat_logo.svg';
import xverseLogo from '@assets/img/restoreWallet/xverse_logo.svg';
import type { DerivationType } from '@secretkeylabs/xverse-core';
import BackButton from '@ui-library/backButton';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.m,
}));

const Description = styled.p((props) => ({
  ...props.theme.typography.body_l,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xxl,
}));

const ItemsContainer = styled.div((props) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
  gap: props.theme.space.xs,
}));

const ItemButton = styled.button((props) => ({
  ...props.theme.typography.body_medium_m,
  display: 'flex',
  alignItems: 'center',
  gap: props.theme.space.s,
  padding: props.theme.space.xs,
  border: `1px solid ${props.theme.colors.white_850}`,
  borderRadius: props.theme.radius(2),
  color: props.theme.colors.white_400,
  backgroundColor: 'transparent',
  transition: 'color 0.1s ease, background-color 0.1s ease',
  '&:hover': {
    color: props.theme.colors.white_200,
    backgroundColor: props.theme.colors.elevation6_800,
  },
  '&:active': {
    color: props.theme.colors.white_0,
    backgroundColor: props.theme.colors.elevation6_600,
  },
}));

const WalletIcon = styled.img((props) => ({
  width: 40,
  height: 40,
  borderRadius: props.theme.radius(1),
}));

const SelectOtherContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.m,
  marginTop: props.theme.space.xxl,
}));

const SelectOtherText = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.xxxs,
}));

const WALLET_LIST = [
  {
    name: 'Xverse',
    icon: xverseLogo,
    derivationType: 'account' as const,
    autoDetect: true,
  },
  {
    name: 'Magic Eden',
    icon: magicEdenLogo,
    derivationType: 'account' as const,
  },
  {
    name: 'Unisat',
    icon: unisatLogo,
    derivationType: 'index' as const,
  },
  {
    name: 'Phantom',
    icon: phantomLogo,
    derivationType: 'index' as const,
  },
  {
    name: 'Leather',
    icon: leatherLogo,
    derivationType: 'index' as const,
    show24Words: true,
    autoDetect: true,
  },
  {
    name: 'OKX Wallet',
    icon: okxLogo,
    derivationType: 'index' as const,
  },
];

type Props = {
  onContinue: ({
    sourceWalletDerivationType,
    autoDetect,
    show24Words,
  }: {
    sourceWalletDerivationType: DerivationType;
    autoDetect?: boolean;
    show24Words?: boolean;
  }) => void;
  onBack: () => void;
};

function OtherWalletSelector({ onContinue, onBack }: Props): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_WALLET_SCREEN' });

  return (
    <Container>
      <BackButton onClick={onBack} />
      <Title>{t('RESTORE_WALLET')}</Title>
      <Description>{t('IMPORT_OTHER_WALLETS.DESCRIPTION')}</Description>
      <ItemsContainer>
        {WALLET_LIST.map((wallet) => (
          <ItemButton
            key={wallet.name}
            onClick={() =>
              onContinue({
                sourceWalletDerivationType: wallet.derivationType,
                autoDetect: wallet.autoDetect ?? false,
                show24Words: wallet.show24Words ?? false,
              })
            }
          >
            <WalletIcon src={wallet.icon} alt={`${wallet.name} logo`} />
            {wallet.name}
          </ItemButton>
        ))}
      </ItemsContainer>
      <SelectOtherContainer>
        <SelectOtherText>
          <StyledP typography="body_medium_l" color="white_0">
            {t('IMPORT_OTHER_WALLETS.NOT_SURE_WHERE_TO_GO')}
          </StyledP>
          <StyledP typography="body_m" color="white_200">
            {t('IMPORT_OTHER_WALLETS.SELECT_OTHER_DESCRIPTION')}
          </StyledP>
        </SelectOtherText>
        <ItemButton
          onClick={() =>
            onContinue({
              sourceWalletDerivationType: 'index',
              autoDetect: true,
              show24Words: false,
            })
          }
        >
          <WalletIcon src={autoDetectLogo} alt="Other logo" />
          {t('IMPORT_OTHER_WALLETS.OTHER')}
        </ItemButton>
      </SelectOtherContainer>
    </Container>
  );
}

export default OtherWalletSelector;
