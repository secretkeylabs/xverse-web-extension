import PreferredBtcAddressItem from '@components/preferredBtcAddressItem';
import useBtcClient from '@hooks/apiClients/useBtcClient';
import useVault from '@hooks/useVault';
import type { BtcPaymentType } from '@secretkeylabs/xverse-core';
import { getPaymentAccountSummary } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import { InputFeedback } from '@ui-library/inputFeedback';
import Spinner from '@ui-library/spinner';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const SpinnerContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 300,
  minHeight: 550,
});

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 550,
});

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  color: props.theme.colors.white_0,
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.m,
}));

const BodyContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
});

const SummaryContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  margin: '18px 0',
});

const TypesContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
  marginTop: props.theme.space.s,
  marginBottom: props.theme.space.m,
}));

const ButtonContainer = styled.div((props) => ({
  width: '100%',
  marginBottom: props.theme.space.xxl,
}));

const LearnMoreLink = styled.a((props) => ({
  marginTop: props.theme.space.xs,
  cursor: 'pointer',
  div: {
    transition: 'color 0.1s ease',
    '&:hover': {
      color: props.theme.colors.white_0,
    },
  },
}));

type Props = {
  selectedType: BtcPaymentType;
  onSelectedTypeChange: (type: BtcPaymentType) => void;
  onContinue: () => void;
};

export default function PaymentAddressTypeSelector({
  selectedType,
  onSelectedTypeChange,
  onContinue,
}: Props) {
  const btcClient = useBtcClient();
  const { t } = useTranslation('translation', {
    keyPrefix: 'RESTORE_WALLET_SCREEN.SELECT_ADDRESS_TYPE',
  });
  const { t: tRestore } = useTranslation('translation', {
    keyPrefix: 'RESTORE_WALLET_SCREEN',
  });

  const vault = useVault();

  const { data, isLoading } = useQuery({
    queryKey: ['onboardingBtcAddressBalance'],
    queryFn: async () => {
      // we should only have 1 wallet at this point
      const walletIds = await vault.SeedVault.getWalletIds();
      const [walletId] = walletIds;
      const { rootNode, derivationType } = await vault.SeedVault.getWalletRootNode(walletId);
      return getPaymentAccountSummary({
        btcClient,
        rootNode,
        walletId,
        derivationType,
        network: 'Mainnet',
        limit: 10,
      });
    },
    refetchOnMount: true,
  });

  useEffect(() => {
    if (isLoading || !data) return;
    const preferredType = data.nestedTotalSats > data.nativeTotalSats ? 'nested' : 'native';
    onSelectedTypeChange(preferredType);
  }, [data, isLoading]);

  if (isLoading || !data) {
    return (
      <SpinnerContainer>
        <Spinner size={50} />
      </SpinnerContainer>
    );
  }

  const onClickType = (type: BtcPaymentType) => () => onSelectedTypeChange(type);

  const totalFunds = data.nativeTotalSats + data.nestedTotalSats;

  return (
    <Container>
      <Title>{t('TITLE')}</Title>
      <BodyContainer>
        <StyledP typography="body_m" color="white_200">
          {t('DESCRIPTION')}
        </StyledP>
        <LearnMoreLink
          href="https://www.xverse.app/blog/segwit-vs-native-segwit-addresses"
          target="_blank"
          rel="noreferrer"
        >
          <InputFeedback message={t('LEARN_MORE')} />
        </LearnMoreLink>
        <SummaryContainer>
          <StyledP typography="body_bold_m" color="white_200">
            {t('ACCOUNT_COUNT', {
              accounts: `${data.accountCount}${data.hasMoreAccounts ? '+' : ''}`,
            })}
          </StyledP>
          <TypesContainer>
            <PreferredBtcAddressItem
              title="Native SegWit"
              balanceSats={data.nativeTotalSats}
              isSelected={selectedType === 'native'}
              onClick={onClickType('native')}
            />
            <PreferredBtcAddressItem
              title="Nested SegWit"
              balanceSats={data.nestedTotalSats}
              isSelected={selectedType === 'nested'}
              onClick={onClickType('nested')}
            />
          </TypesContainer>
          <StyledP typography="body_m" color="white_200">
            {totalFunds !== 0n && t('ACCOUNT_SUMMARY_DESCRIPTION')}
            {totalFunds === 0n && t('ACCOUNT_SUMMARY_DESCRIPTION_NO_FUNDS')}
          </StyledP>
        </SummaryContainer>
      </BodyContainer>
      <ButtonContainer>
        <Button onClick={onContinue} title={tRestore('CONTINUE_BUTTON')} />
      </ButtonContainer>
    </Container>
  );
}
