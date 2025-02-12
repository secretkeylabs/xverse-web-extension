import ledgerConnectDefaultIcon from '@assets/img/hw/ledger/ledger_connect_default.svg';
import ledgerConnectStxIcon from '@assets/img/hw/ledger/ledger_import_connect_stx.svg';
import { delay } from '@common/utils/promises';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import TransactionSettingAlert from '@components/transactionSetting';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useNetworkSelector from '@hooks/useNetwork';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useVault from '@hooks/useVault';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { FadersHorizontal } from '@phosphor-icons/react';
import {
  estimateStacksTransactionWithFallback,
  getNonce,
  getStxFiatEquivalent,
  microstacksToStx,
  modifyRecommendedStxFees,
  signLedgerStxTransaction,
  signMultiStxTransactions,
  signTransaction,
  stxToMicrostacks,
} from '@secretkeylabs/xverse-core';
import { PostConditionMode, StacksTransactionWire } from '@stacks/transactions';
import SelectFeeRate from '@ui-components/selectFeeRate';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import Sheet from '@ui-library/sheet';
import BigNumber from 'bignumber.js';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';
import {
  ButtonsContainer,
  Container,
  EditNonceButton,
  FeeRateContainer,
  RequestedByText,
  ReviewTransactionText,
  SponsoredInfoText,
  SuccessActionsContainer,
  TitleContainer,
  WarningWrapper,
} from './index.styled';

const Subtitle = styled.p`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_200};
  margin-top: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.xs};
`;

// todo: make fee non option - that'll require change in all components using it
type Props = {
  initialStxTransactions: StacksTransactionWire[];
  loading: boolean;
  onCancelClick: () => void;
  onConfirmClick: (transactions: StacksTransactionWire[]) => void;
  children: ReactNode;
  isSponsored?: boolean;
  skipModal?: boolean;
  isAsset?: boolean;
  title?: string;
  subTitle?: string;
  hasSignatures?: boolean;
  fee?: string | undefined;
  setFeeRate?: (feeRate: string) => void;
};

function ConfirmStxTransactionComponent({
  initialStxTransactions,
  loading,
  isSponsored,
  children,
  isAsset,
  title,
  subTitle,
  onConfirmClick,
  onCancelClick,
  skipModal = false,
  hasSignatures = false,
  fee,
  setFeeRate,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });
  const { t: settingsTranslate } = useTranslation('translation', {
    keyPrefix: 'TRANSACTION_SETTING',
  });
  const selectedNetwork = useNetworkSelector();
  const { stxBtcRate, btcFiatRate } = useSupportedCoinRates();
  const { data: stxData } = useStxWalletData();
  const vault = useVault();
  const [showFeeSettings, setShowFeeSettings] = useState(false);
  const selectedAccount = useSelectedAccount();
  const { feeMultipliers, fiatCurrency } = useWalletSelector();
  const [openTransactionSettingModal, setOpenTransactionSettingModal] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(loading);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxApproved, setIsTxApproved] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);
  const [showFeeWarning, setShowFeeWarning] = useState(false);
  const [feesLoading, setFeesLoading] = useState(false);

  const [feeRates, setFeeRates] = useState({ low: 0, medium: 0, high: 0 });

  const stxBalance = stxData?.availableBalance.toString() ?? '0';
  // TODO: fix type error as any
  const amount = (initialStxTransactions[0]?.payload as any)?.amount;

  useEffect(() => {
    setButtonLoading(loading);
  }, [loading]);

  // Reactively estimate fees
  useEffect(() => {
    const fetchStxFees = async () => {
      try {
        setFeesLoading(true);
        const [low, medium, high] = await estimateStacksTransactionWithFallback(
          initialStxTransactions[0],
          selectedNetwork,
        );

        const modifiedFees = modifyRecommendedStxFees(
          {
            low: low.fee,
            medium: medium.fee,
            high: high.fee,
          },
          feeMultipliers,
          initialStxTransactions[0].payload.payloadType,
        );

        setFeeRates({
          low: microstacksToStx(BigNumber(modifiedFees.low)).toNumber(),
          medium: microstacksToStx(BigNumber(modifiedFees.medium)).toNumber(),
          high: microstacksToStx(BigNumber(modifiedFees.high)).toNumber(),
        });
        if (!fee) setFeeRate?.(Number(microstacksToStx(BigNumber(modifiedFees.low))).toString());
      } catch (e) {
        console.error(e);
      } finally {
        setFeesLoading(false);
      }
    };

    fetchStxFees();
  }, [selectedNetwork, initialStxTransactions, feeMultipliers, fee, setFeeRate]);

  useEffect(() => {
    if (!feeMultipliers || !fee) return;

    const feeExceedsThreshold = stxToMicrostacks(new BigNumber(fee)).isGreaterThan(
      BigNumber(feeMultipliers.thresholdHighStacksFee),
    );

    if (feeExceedsThreshold) {
      setShowFeeWarning(true);
    } else if (showFeeWarning) {
      setShowFeeWarning(false);
    }
  }, [initialStxTransactions, feeMultipliers]);

  const stxToFiat = (stx: string) =>
    getStxFiatEquivalent(
      stxToMicrostacks(BigNumber(stx)),
      BigNumber(stxBtcRate),
      BigNumber(btcFiatRate),
    ).toString();

  const getFee = () => {
    const defaultFee = isSponsored
      ? BigNumber(0)
      : fee
      ? BigNumber(fee)
      : BigNumber(feeRates.medium);
    return defaultFee;
  };

  const getTxNonce = (): string => {
    const nonce = getNonce(initialStxTransactions[0]);
    return nonce.toString();
  };

  const onAdvancedSettingClick = () => {
    setOpenTransactionSettingModal(true);
  };

  const closeTransactionSettingAlert = () => {
    setOpenTransactionSettingModal(false);
  };

  const onConfirmButtonClick = async () => {
    if (skipModal) {
      onConfirmClick(initialStxTransactions);
      return;
    }
    if (selectedAccount.accountType !== 'software') {
      setIsModalVisible(true);
      return;
    }

    const { rootNode, derivationType } = await vault.SeedVault.getWalletRootNode(
      selectedAccount.walletId,
    );
    let signedTxs: StacksTransactionWire[] = [];

    if (fee) {
      for (let i = 0; i < initialStxTransactions.length; i++) {
        initialStxTransactions[i].setFee(stxToMicrostacks(BigNumber(fee)).toString());
      }
    }

    if (initialStxTransactions.length === 1) {
      const transaction = initialStxTransactions[0];
      const signedContractCall = await signTransaction(
        transaction,
        rootNode,
        derivationType,
        selectedAccount?.id ?? 0,
        selectedNetwork,
      );
      signedTxs.push(signedContractCall);
    } else if (initialStxTransactions.length === 2) {
      signedTxs = await signMultiStxTransactions(
        initialStxTransactions,
        selectedAccount?.id ?? 0,
        selectedNetwork,
        rootNode,
        derivationType,
      );
    }
    onConfirmClick(signedTxs);
  };

  const applyTxSettings = ({
    fee: settingFee,
    nonce,
  }: {
    fee: string;
    feeRate?: string;
    nonce?: string;
  }) => {
    if (nonce && nonce !== '') {
      initialStxTransactions[0].setNonce(BigInt(nonce));
    }
    setOpenTransactionSettingModal(false);
  };

  const handleConnectAndConfirm = async () => {
    if (!selectedAccount) {
      console.error('No account selected');
      return;
    }

    if (selectedAccount.deviceAccountIndex === undefined) {
      console.error('No account found');
      return;
    }
    setIsButtonDisabled(true);
    const transport = await Transport.create();

    if (!transport) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
      return;
    }

    setIsConnectSuccess(true);
    await delay(1500);
    setCurrentStepIndex(1);
    try {
      if (fee) {
        for (let i = 0; i < initialStxTransactions.length; i++) {
          initialStxTransactions[i].setFee(stxToMicrostacks(BigNumber(fee)).toString());
        }
      }

      const signedTxs = await signLedgerStxTransaction({
        transport,
        transactionBuffer: Buffer.from(initialStxTransactions[0].serializeBytes()),
        addressIndex: selectedAccount.deviceAccountIndex,
      });
      setIsTxApproved(true);
      await delay(1500);
      onConfirmClick([signedTxs]);
    } catch (e) {
      console.error(e);
      setIsTxRejected(true);
      setIsButtonDisabled(false);
    } finally {
      transport.close();
    }
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  const setTxFee = (stxFee: string) => {
    const feeToSet = stxToMicrostacks(BigNumber(stxFee));

    if (
      feeMultipliers &&
      feeToSet.isGreaterThan(BigNumber(feeMultipliers.thresholdHighStacksFee))
    ) {
      setShowFeeWarning(true);
    } else if (showFeeWarning) {
      setShowFeeWarning(false);
    }
    setFeeRate?.(stxFee);
  };

  const checkIfEnoughBalance = (totalFee: number) => {
    const hasInsufficientFunds =
      amount &&
      BigNumber(stxBalance).isLessThan(
        BigNumber(amount).plus(stxToMicrostacks(BigNumber(totalFee ?? 0))),
      );

    if (hasInsufficientFunds) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve(totalFee);
  };

  const showPostConditionModeWarning = initialStxTransactions.some(
    (tx) => tx.postConditionMode === PostConditionMode.Allow,
  );

  return (
    <>
      <Container>
        <TitleContainer>
          {!isAsset && (
            <ReviewTransactionText>{title ?? t('REVIEW_TRANSACTION')}</ReviewTransactionText>
          )}
          {!!subTitle && <RequestedByText>{subTitle}</RequestedByText>}
        </TitleContainer>

        {showFeeWarning && (
          <WarningWrapper>
            <Callout variant="warning" bodyText={t('HIGH_FEE_WARNING_TEXT')} />
          </WarningWrapper>
        )}

        {showPostConditionModeWarning && (
          <WarningWrapper>
            <Callout variant="warning" bodyText={t('POST_CONDITION_MODE_WARNING_TEXT')} />
          </WarningWrapper>
        )}

        {children}

        {!isSponsored && (
          <>
            <Subtitle>{t('FEES')}</Subtitle>
            <FeeRateContainer>
              <SelectFeeRate
                fee={fee}
                feeUnits="STX"
                feeRate={fee ?? '0'}
                setFeeRate={setTxFee}
                baseToFiat={stxToFiat}
                fiatUnit={fiatCurrency}
                getFeeForFeeRate={checkIfEnoughBalance}
                feeRates={feeRates}
                feeRateLimits={{ min: 0.000001, max: feeMultipliers?.thresholdHighStacksFee }}
                isLoading={feesLoading}
                absoluteBalance={Number(microstacksToStx(BigNumber(stxBalance)))}
              />
            </FeeRateContainer>
          </>
        )}

        {isSponsored ? (
          <SponsoredInfoText>{t('SPONSORED_TX_INFO')}</SponsoredInfoText>
        ) : (
          !hasSignatures && (
            <EditNonceButton
              icon={<FadersHorizontal size={20} color={Theme.colors.tangerine} />}
              title={settingsTranslate('ADVANCED_SETTING_NONCE_OPTION')}
              variant="tertiary"
              onClick={onAdvancedSettingClick}
            />
          )
        )}
        <TransactionSettingAlert
          visible={openTransactionSettingModal}
          fee={microstacksToStx(getFee()).toString()}
          nonce={getTxNonce()}
          onApplyClick={applyTxSettings}
          onCrossClick={closeTransactionSettingAlert}
          showFeeSettings={showFeeSettings}
          setShowFeeSettings={setShowFeeSettings}
          nonceSettings
        />
      </Container>
      <ButtonsContainer>
        <Button
          title={t('CANCEL')}
          variant="secondary"
          disabled={buttonLoading}
          onClick={onCancelClick}
        />
        <Button
          title={t('CONFIRM')}
          disabled={buttonLoading}
          loading={buttonLoading}
          onClick={onConfirmButtonClick}
        />
      </ButtonsContainer>
      <Sheet title="" visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        {currentStepIndex === 0 && (
          <LedgerConnectionView
            title={signatureRequestTranslate('LEDGER.CONNECT.TITLE')}
            text={signatureRequestTranslate('LEDGER.CONNECT.SUBTITLE', { name: 'Stacks' })}
            titleFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE')}
            textFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_SUBTITLE')}
            imageDefault={ledgerConnectStxIcon}
            isConnectSuccess={isConnectSuccess}
            isConnectFailed={isConnectFailed}
          />
        )}
        {currentStepIndex === 1 && (
          <LedgerConnectionView
            title={t('LEDGER.CONFIRM.TITLE')}
            text={t('LEDGER.CONFIRM.SUBTITLE')}
            titleFailed={t('LEDGER.CONFIRM.ERROR_TITLE')}
            textFailed={t('LEDGER.CONFIRM.ERROR_SUBTITLE')}
            imageDefault={ledgerConnectDefaultIcon}
            isConnectSuccess={isTxApproved}
            isConnectFailed={isTxRejected}
          />
        )}
        <SuccessActionsContainer>
          <Button
            onClick={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
            title={t(
              isTxRejected || isConnectFailed ? 'LEDGER.RETRY_BUTTON' : 'LEDGER.CONNECT_BUTTON',
            )}
            disabled={isButtonDisabled}
            loading={isButtonDisabled}
          />
          <Button onClick={onCancelClick} title={t('LEDGER.CANCEL_BUTTON')} variant="secondary" />
        </SuccessActionsContainer>
      </Sheet>
    </>
  );
}

export default ConfirmStxTransactionComponent;
