import type { DerivationType } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { StyledP } from '@ui-library/common.styled';
import Link from '@ui-library/link';
import Spinner from '@ui-library/spinner';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { Summary } from '../types';
import AccountBreakdown from './accountBreakdown';
import PreferredTypeItem from './preferredTypeItem';

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
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.m,
}));

const Description = styled.div((props) => ({
  ...props.theme.typography.body_l,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.m,
}));

const BodyContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
});

const SummaryContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  margin: `${props.theme.space.l} 0`,
}));

const TypesContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
}));

const ButtonContainer = styled.div((props) => ({
  width: '100%',
  marginBottom: props.theme.space.xxl,
}));

const CalloutContainer = styled.div((props) => ({
  marginBottom: props.theme.space.l,
}));

const SUPPORT_DERIVATION_TYPE_LINK =
  'https://support.xverse.app/hc/en-us/articles/28787677710989-Understanding-Derivation-Paths-and-Xverse-Wallet-Compatibility#h_01J3YZDTVSV3Z19FA9VBTRZPY3';

type Props = {
  onContinue: (finalSelection: DerivationType) => void;
  summaryIsLoading: boolean;
  autoDetectDerivationType: boolean;
  preferredAutoDerivationType: DerivationType;
  summaryData:
    | {
        accountSummary: Summary;
        indexSummary: Summary;
      }
    | undefined;
};

export default function DerivationTypeSelector({
  onContinue,
  summaryIsLoading,
  autoDetectDerivationType,
  preferredAutoDerivationType,
  summaryData,
}: Props) {
  const { t } = useTranslation('translation', {
    keyPrefix: 'RESTORE_WALLET_SCREEN.SELECT_DERIVATION_TYPE',
  });
  const { t: tCommon } = useTranslation('translation', {
    keyPrefix: 'COMMON',
  });
  const [selectedType, setSelectedType] = useState<DerivationType | undefined>(undefined);
  const [typeAccountsToShow, setTypeAccountsToShow] = useState<DerivationType | undefined>(
    undefined,
  );

  const shouldAutoContinue = summaryIsLoading
    ? false
    : autoDetectDerivationType &&
      summaryData &&
      // only auto continue if there are no accounts or only a single account (shared between the two types) on one path
      (summaryData.indexSummary.accountCount <= 1 || summaryData.accountSummary.accountCount <= 1);

  useEffect(() => {
    if (!shouldAutoContinue) {
      return;
    }

    let finalDerivationType = preferredAutoDerivationType;
    if (summaryData) {
      if (summaryData.accountSummary.accountCount > summaryData.indexSummary.accountCount) {
        // more accounts in account path, so use that
        finalDerivationType = 'account';
      } else if (summaryData.indexSummary.accountCount > summaryData.accountSummary.accountCount) {
        // more accounts in index path, so use that
        finalDerivationType = 'index';
      }
      // if neither prevail, use the preferred auto derivation type
    }
    onContinue(finalDerivationType);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't need to change on the others
  }, [shouldAutoContinue]);

  if (shouldAutoContinue || summaryIsLoading || !summaryData) {
    return (
      <SpinnerContainer>
        <Spinner size={50} />
      </SpinnerContainer>
    );
  }

  const onClickType = (type: DerivationType) => () => setSelectedType(type);

  if (typeAccountsToShow) {
    const summary =
      typeAccountsToShow === 'account' ? summaryData.accountSummary : summaryData.indexSummary;

    return (
      <AccountBreakdown
        derivationType={typeAccountsToShow}
        summary={summary}
        onBack={() => setTypeAccountsToShow(undefined)}
      />
    );
  }

  return (
    <Container>
      <Title>{t('TITLE')}</Title>
      <BodyContainer>
        <Description>{t('DESCRIPTION')}</Description>
        <Link href={SUPPORT_DERIVATION_TYPE_LINK}>{tCommon('LEARN_MORE')}</Link>
        <SummaryContainer>
          <TypesContainer>
            <PreferredTypeItem
              title={`${t('WALLET')} 1`}
              accountCount={summaryData.accountSummary.accountCount}
              isSelected={selectedType === 'account'}
              onClick={onClickType('account')}
              onShowAccountsClick={() => setTypeAccountsToShow('account')}
            />
            <PreferredTypeItem
              title={`${t('WALLET')} 2`}
              accountCount={summaryData.indexSummary.accountCount}
              isSelected={selectedType === 'index'}
              onClick={onClickType('index')}
              onShowAccountsClick={() => setTypeAccountsToShow('index')}
            />
          </TypesContainer>
        </SummaryContainer>
      </BodyContainer>
      <CalloutContainer>
        <Callout
          titleText={t('CALLOUT.TITLE')}
          bodyText={
            <>
              <StyledP typography="body_m" color="white_200">
                {t('CALLOUT.DESCRIPTION_1')}
              </StyledP>
              <br />
              <StyledP typography="body_m" color="white_200">
                {t('CALLOUT.DESCRIPTION_2')}
              </StyledP>
            </>
          }
        />
      </CalloutContainer>
      <ButtonContainer>
        <Button
          disabled={!selectedType}
          onClick={() => {
            if (!selectedType) return;

            return onContinue(selectedType);
          }}
          title={tCommon('CONFIRM')}
        />
      </ButtonContainer>
    </Container>
  );
}
