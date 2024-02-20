import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectStxIcon from '@assets/img/ledger/ledger_import_connect_stx.svg';
import { delay } from '@common/utils/ledger';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import InfoContainer from '@components/infoContainer';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import TransactionSettingAlert from '@components/transactionSetting';
import TransferFeeView from '@components/transferFeeView';
import useNetworkSelector from '@hooks/useNetwork';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { FadersHorizontal } from '@phosphor-icons/react';
import type { StacksTransaction } from '@secretkeylabs/xverse-core';
import {
  getNonce,
  getStxFiatEquivalent,
  microstacksToStx,
  setNonce,
  signLedgerStxTransaction,
  signMultiStxTransactions,
  signTransaction,
  stxToMicrostacks,
} from '@secretkeylabs/xverse-core';
import { estimateTransaction } from '@stacks/transactions';
import SelectFeeRate from '@ui-components/selectFeeRate';
import { StyledP } from '@ui-library/common.styled';
import { isHardwareAccount } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: 22px;
  margin-left: 16px;
  margin-right: 16px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  paddingTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(12),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  backgroundColor: props.theme.colors.background.elevation0,
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
}));

const ButtonText = styled(StyledP)`
  margin-left: ${(props) => props.theme.space.xxs};
`;

const SponsoredInfoText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_400,
}));

const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(6),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(20),
}));

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white_0,
  textAlign: 'left',
}));

const RequestedByText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_400,
  marginTop: props.theme.spacing(4),
  textAlign: 'left',
}));

const TitleContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(16),
}));

const WarningWrapper = styled.div((props) => ({
  marginBottom: props.theme.spacing(8),
}));

const FeeRateContainer = styled.div`
  margin-top: ${(props) => props.theme.space.m};
  margin-bottom: ${(props) => props.theme.space.m};
`;

// todo: make fee non option - that'll require change in all components using it
interface Props {
  initialStxTransactions: StacksTransaction[];
  loading: boolean;
  onCancelClick: () => void;
  onConfirmClick: (transactions: StacksTransaction[]) => void;
  children: ReactNode;
  isSponsored?: boolean;
  skipModal?: boolean;
  isAsset?: boolean;
  title?: string;
  subTitle?: string;
  hasSignatures?: boolean;
  feeOverride?: BigNumber;
  fee?: string | undefined;
  setFeeRate?: (feeRate: string) => void;
}

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
  feeOverride,
  fee,
  setFeeRate,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });
  const selectedNetwork = useNetworkSelector();
  const { stxBalance, stxBtcRate, btcFiatRate, fiatCurrency } = useWalletSelector();
  const { getSeed } = useSeedVault();
  const [showFeeSettings, setShowFeeSettings] = useState(false);
  const { selectedAccount, feeMultipliers } = useWalletSelector();
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

  const [feeRates, setFeeRates] = useState({ low: 0, medium: 0, high: 0 });

  useEffect(() => {
    setButtonLoading(loading);
  }, [loading]);

  // Reactively estimate fees
  useEffect(() => {
    const fetchStxFees = async () => {
      const [low, medium, high] = await estimateTransaction(
        initialStxTransactions[0].payload,
        undefined,
        selectedNetwork,
      );
      setFeeRates({
        low: Number(microstacksToStx(new BigNumber(low.fee)).toFixed(2)),
        medium: Number(microstacksToStx(new BigNumber(medium.fee)).toFixed(2)),
        high: Number(microstacksToStx(new BigNumber(high.fee)).toFixed(2)),
      });
      if (!fee)
        setFeeRate?.(Number(microstacksToStx(new BigNumber(medium.fee)).toFixed(2)).toString());
    };

    fetchStxFees();
  }, [selectedNetwork, initialStxTransactions]);

  useEffect(() => {
    const stxTxFee = new BigNumber(initialStxTransactions[0].auth.spendingCondition.fee.toString());

    if (
      feeMultipliers &&
      stxTxFee.isGreaterThan(new BigNumber(feeMultipliers.thresholdHighStacksFee))
    ) {
      setShowFeeWarning(true);
    } else if (showFeeWarning) {
      setShowFeeWarning(false);
    }
  }, [initialStxTransactions, feeMultipliers]);

  const stxToFiat = (stx: string) =>
    getStxFiatEquivalent(
      stxToMicrostacks(new BigNumber(stx)),
      new BigNumber(stxBtcRate),
      new BigNumber(btcFiatRate),
    )
      .toNumber()
      .toFixed(2);

  const getFee = () =>
    isSponsored
      ? new BigNumber(0)
      : new BigNumber(
          initialStxTransactions
            .map((tx) => tx?.auth?.spendingCondition?.fee ?? BigInt(0))
            .reduce((prev, curr) => prev + curr, BigInt(0))
            .toString(10),
        );

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
    if (isHardwareAccount(selectedAccount)) {
      setIsModalVisible(true);
      return;
    }

    const seed = await getSeed();
    let signedTxs: StacksTransaction[] = [];
    if (initialStxTransactions.length === 1) {
      const signedContractCall = await signTransaction(
        initialStxTransactions[0],
        seed,
        selectedAccount?.id ?? 0,
        selectedNetwork,
      );
      signedTxs.push(signedContractCall);
    } else if (initialStxTransactions.length === 2) {
      signedTxs = await signMultiStxTransactions(
        initialStxTransactions,
        selectedAccount?.id ?? 0,
        selectedNetwork,
        seed,
      );
    }
    onConfirmClick(signedTxs);
  };

  // todo: remove this
  const applyTxSettings = ({
    fee: settingFee,
    nonce,
  }: {
    fee: string;
    feeRate?: string;
    nonce?: string;
  }) => {
    // const fee = stxToMicrostacks(new BigNumber(settingFee));

    // if (feeMultipliers && fee.isGreaterThan(new BigNumber(feeMultipliers.thresholdHighStacksFee))) {
    //   setShowFeeWarning(true);
    // } else if (showFeeWarning) {
    //   setShowFeeWarning(false);
    // }

    // // todo: fix deprecated
    // setFee(initialStxTransactions[0], BigInt(fee.toString()));
    if (nonce && nonce !== '') {
      setNonce(initialStxTransactions[0], BigInt(nonce));
    }
    setOpenTransactionSettingModal(false);
  };

  // todo: remove this
  // useEffect(() => {
  //   if (feeOverride) {
  //     applyTxSettings({ fee: microstacksToStx(feeOverride).toString() });
  //   }
  // }, [feeOverride]);

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
      const signedTxs = await signLedgerStxTransaction({
        transport,
        transactionBuffer: Buffer.from(initialStxTransactions[0].serialize()),
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
            <InfoContainer type="Warning" bodyText={t('HIGH_FEE_WARNING_TEXT')} />
          </WarningWrapper>
        )}

        {children}
        <TransferFeeView
          fee={microstacksToStx(getFee())}
          currency="STX"
          title="Network Fee"
          customFeeClick={() => {}}
        />

        <FeeRateContainer>
          <SelectFeeRate
            fee={microstacksToStx(new BigNumber(fee ?? '0')).toString()}
            feeUnits="STX"
            feeRate={fee ?? ''}
            setFeeRate={setFeeRate ?? (() => {})}
            baseToFiat={stxToFiat}
            fiatUnit={fiatCurrency}
            getFeeForFeeRate={(feeForFeeRate) => Promise.resolve(feeForFeeRate)}
            feeRates={feeRates}
            feeRateLimits={{ min: 0.000001, max: feeMultipliers?.thresholdHighStacksFee }}
            isLoading={loading}
            absoluteBalance={Number(microstacksToStx(new BigNumber(stxBalance)))}
          />
        </FeeRateContainer>

        {/* TODO fix type error as any */}
        {(initialStxTransactions[0]?.payload as any)?.amount && (
          <TransferFeeView
            fee={microstacksToStx(
              getFee().plus(
                new BigNumber((initialStxTransactions[0]?.payload as any).amount?.toString(10)),
              ),
            )}
            currency="STX"
            title={t('TOTAL')}
            subtitle="Amount + fees"
          />
        )}
        {isSponsored ? (
          <SponsoredInfoText>{t('SPONSORED_TX_INFO')}</SponsoredInfoText>
        ) : (
          !hasSignatures && (
            <Button onClick={onAdvancedSettingClick}>
              <>
                <FadersHorizontal size={20} color={Theme.colors.tangerine} />
                <ButtonText typography="body_medium_m" color="tangerine">
                  Edit Nonce
                </ButtonText>
              </>
            </Button>
          )
        )}
        <TransactionSettingAlert
          visible={openTransactionSettingModal}
          fee={microstacksToStx(getFee()).toString()}
          type="STX"
          nonce={getTxNonce()}
          onApplyClick={applyTxSettings}
          onCrossClick={closeTransactionSettingAlert}
          showFeeSettings={showFeeSettings}
          setShowFeeSettings={setShowFeeSettings}
        />
      </Container>
      <ButtonContainer>
        <TransparentButtonContainer>
          <ActionButton
            text={t('CANCEL')}
            transparent
            disabled={buttonLoading}
            onPress={onCancelClick}
          />
        </TransparentButtonContainer>
        <ActionButton
          text={t('CONFIRM')}
          disabled={buttonLoading}
          processing={buttonLoading}
          onPress={onConfirmButtonClick}
        />
      </ButtonContainer>
      <BottomModal header="" visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
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
          <ActionButton
            onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
            text={t(
              isTxRejected || isConnectFailed ? 'LEDGER.RETRY_BUTTON' : 'LEDGER.CONNECT_BUTTON',
            )}
            disabled={isButtonDisabled}
            processing={isButtonDisabled}
          />
          <ActionButton onPress={onCancelClick} text={t('LEDGER.CANCEL_BUTTON')} transparent />
        </SuccessActionsContainer>
      </BottomModal>
    </>
  );
}

export default ConfirmStxTransactionComponent;
