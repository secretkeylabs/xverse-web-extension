import PreferredBtcAddressItem from '@components/preferredBtcAddressItem';
import useBtcClient from '@hooks/apiClients/useBtcClient';
import { sha256 } from '@noble/hashes/sha256';
import type { BtcPaymentType } from '@secretkeylabs/xverse-core';
import { getPaymentAccountSummaryForSeedPhrase } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import Button from '@ui-library/button';
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
  maxWidth: 330,
  minHeight: 550,
});

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(21),
  marginBottom: props.theme.spacing(16),
  textAlign: 'center',
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

const TypesContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  margin: '4px 0',
});

const Text = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
}));

const BoldText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_200,
}));

const ButtonContainer = styled.div((props) => ({
  width: '100%',
  marginBottom: props.theme.spacing(15),
}));

type Props = {
  seedPhrase: string;
  selectedType: BtcPaymentType;
  onSelectedTypeChange: (type: BtcPaymentType) => void;
  onContinue: () => void;
};

export default function PaymentAddressTypeSelector({
  seedPhrase,
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

  const { data, isLoading } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['onboardingBtcAddressBalance', sha256(seedPhrase.substring(0, 20)).toString()],
    queryFn: () => getPaymentAccountSummaryForSeedPhrase(btcClient, seedPhrase, 'Mainnet', 20),
  });

  useEffect(() => {
    if (isLoading || !data) return;
    const preferredType = data.nativeTotalSats > data.nestedTotalSats ? 'native' : 'nested';
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

  return (
    <Container>
      <Title>{t('TITLE')}</Title>
      <BodyContainer>
        <Text>{t('DESCRIPTION')}</Text>
        <SummaryContainer>
          <BoldText>
            {t('ACCOUNT_COUNT', {
              accounts: `${data.accountCount}${data.hasMoreAccounts ? '+' : ''}`,
            })}
          </BoldText>
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
          <Text>{t('ACCOUNT_SUMMARY_DESCRIPTION')}</Text>
        </SummaryContainer>
      </BodyContainer>
      <ButtonContainer>
        <Button onClick={onContinue} title={tRestore('CONTINUE_BUTTON')} />
      </ButtonContainer>
    </Container>
  );
}
