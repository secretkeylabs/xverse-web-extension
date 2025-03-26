import keystoneConnectDefaultIcon from '@assets/img/hw/keystone/keystone_connect_default.svg';
import keystoneConnectBtcIcon from '@assets/img/hw/keystone/keystone_import_connect_btc.svg';
import ledgerConnectDefaultIcon from '@assets/img/hw/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/hw/ledger/ledger_import_connect_btc.svg';
import ledgerConnectStxIcon from '@assets/img/hw/ledger/ledger_import_connect_stx.svg';
import { delay } from '@common/utils/promises';
import KeystoneConnectionView from '@components/keystone/connectKeystoneView';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import SpeedUpBtcTransaction from '@components/speedUpTransaction/btc';
import SpeedUpStxTransaction from '@components/speedUpTransaction/stx';
import TopRow from '@components/topRow';
import useBtcClient from '@hooks/apiClients/useBtcClient';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useTransaction from '@hooks/queries/useTransaction';
import useNetworkSelector from '@hooks/useNetwork';
import useRbfTransactionData, {
  getLatestNonce,
  getRawTransaction,
  isBtcTransaction,
} from '@hooks/useRbfTransactionData';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import useVault from '@hooks/useVault';
import useWalletSelector from '@hooks/useWalletSelector';
import { createKeystoneTransport } from '@keystonehq/hw-transport-webusb';
import Transport from '@ledgerhq/hw-transport-webusb';
import { CarProfile, Lightning, RocketLaunch, ShootingStar } from '@phosphor-icons/react';
import {
  broadcastSignedTransaction,
  signLedgerStxTransaction,
  signTransaction,
  stxToMicrostacks,
  type KeystoneTransport,
  type LedgerTransport,
} from '@secretkeylabs/xverse-core';
import { deserializeTransaction, StacksTransactionWire } from '@stacks/transactions';
import Button from '@ui-library/button';
import Sheet from '@ui-library/sheet';
import Spinner from '@ui-library/spinner';
import { EMPTY_LABEL } from '@utils/constants';
import { isKeystoneAccount, isLedgerAccount } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from 'styled-components';
import CustomFee from './customFee';
import { LoaderContainer, SuccessActionsContainer } from './index.styled';

function SpeedUpTransactionScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SPEED_UP_TRANSACTION' });
  const theme = useTheme();
  const navigate = useNavigate();

  const [showCustomFee, setShowCustomFee] = useState(false);
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const { data: stxData } = useStxWalletData();
  const { id } = useParams();
  const location = useLocation();
  const btcClient = useBtcClient();
  const [feeRateInput, setFeeRateInput] = useState<string | undefined>();
  const [selectedOption, setSelectedOption] = useState<string | undefined>();
  const { transaction: stxTransaction } = location.state || {};
  const { data: btcTransaction } = useTransaction(stxTransaction ? undefined : id);
  const { isLoading, rbfTransaction, rbfRecommendedFees, rbfTxSummary, mempoolFees } =
    useRbfTransactionData(stxTransaction || btcTransaction);
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });
  const [isLedgerModalVisible, setIsLedgerModalVisible] = useState(false);
  const [isKeystoneModalVisible, setIsKeystoneModalVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isHardwareWalletConnectButtonDisabled, setIsHardwareWalletConnectButtonDisabled] =
    useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);
  const [customFeeRate, setCustomFeeRate] = useState<string | undefined>();
  const [customTotalFee, setCustomTotalFee] = useState<string | undefined>();
  const [customFeeError, setCustomFeeError] = useState<string | undefined>();
  const vault = useVault();
  const selectedStacksNetwork = useNetworkSelector();
  const isBtc = isBtcTransaction(stxTransaction || btcTransaction);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const transactionContext = useTransactionContext();

  const handleClickFeeButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.value === 'custom') {
      setShowCustomFee(true);
      return;
    }

    if (rbfRecommendedFees) {
      const feeObj = rbfRecommendedFees[e.currentTarget.value];

      if (feeObj?.enoughFunds) {
        setFeeRateInput(feeObj.feeRate);
        setSelectedOption(e.currentTarget.value);
      }
    }
  };

  const handleGoBack = () => {
    // HACKY: navigate back to homepage to give mempool api time to consolidate transactions
    // otherwise, the original replaced transaction may still appear
    navigate('/');
  };

  const calculateStxTotalFee = async (feeRate: string) => {
    if (rbfTxSummary && Number(feeRate) < rbfTxSummary.minimumRbfFeeRate) {
      setCustomFeeError(t('FEE_TOO_LOW', { minimumFee: rbfTxSummary.minimumRbfFeeRate }));
      return;
    }

    if (stxToMicrostacks(BigNumber(feeRate)).gt(BigNumber(stxData?.availableBalance ?? 0))) {
      setCustomFeeError(t('INSUFFICIENT_FUNDS'));
    } else {
      setCustomFeeError(undefined);
    }

    return Number(feeRate);
  };

  const calculateTotalFee = async (feeRate: string) => {
    if (!isBtc) {
      return calculateStxTotalFee(feeRate);
    }

    if (!rbfTransaction) {
      return;
    }

    if (rbfTxSummary && Number(feeRate) < rbfTxSummary.minimumRbfFeeRate) {
      setCustomFeeError(t('FEE_TOO_LOW', { minimumFee: rbfTxSummary.minimumRbfFeeRate }));
      return;
    }

    const feeSummary: {
      enoughFunds: boolean;
      fee?: number;
      feeRate: number;
    } = await rbfTransaction.getRbfFeeSummary(Number(feeRate));

    if (!feeSummary.enoughFunds) {
      setCustomFeeError(t('INSUFFICIENT_FUNDS'));
    } else {
      setCustomFeeError(undefined);
    }

    return feeSummary.fee;
  };

  const signAndBroadcastStxTx = async (transport?: LedgerTransport) => {
    if (!feeRateInput) {
      return;
    }

    try {
      setIsBroadcasting(true);
      const fee = stxToMicrostacks(BigNumber(feeRateInput)).toString();
      const txRaw: string = await getRawTransaction(stxTransaction.txid, network);
      const unsignedTx = deserializeTransaction(txRaw);

      // check if the transaction exists in microblock
      const latestNonceData = await getLatestNonce(selectedAccount.stxAddress, network);
      if (stxTransaction.nonce > latestNonceData.last_executed_tx_nonce) {
        unsignedTx.setFee(BigInt(fee));
        unsignedTx.setNonce(BigInt(stxTransaction.nonce));

        if (isLedgerAccount(selectedAccount)) {
          if (!transport || selectedAccount.deviceAccountIndex === undefined) {
            return;
          }

          const result = await signLedgerStxTransaction({
            transport,
            transactionBuffer: Buffer.from(unsignedTx.serializeBytes()),
            addressIndex: selectedAccount.deviceAccountIndex,
          });
          await delay(1500);
          await broadcastSignedTransaction(result, selectedStacksNetwork);
        } else if (selectedAccount.accountType === 'software') {
          const rootNodeData = await vault.SeedVault.getWalletRootNode(selectedAccount.walletId);
          const signedTx: StacksTransactionWire = await signTransaction(
            unsignedTx,
            rootNodeData.rootNode,
            rootNodeData.derivationType,
            selectedAccount.id,
            selectedStacksNetwork,
          );
          await broadcastSignedTransaction(signedTx, selectedStacksNetwork);
        }

        toast.success(t('TX_FEE_UPDATED'));
        handleGoBack();
        return;
      }

      toast.error('This transaction has already been confirmed in a block.');
      return;
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to broadcast transaction.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const signAndBroadcastTx = async (options?: {
    ledgerTransport?: LedgerTransport;
    keystoneTransport?: KeystoneTransport;
  }) => {
    if (!isBtc) {
      return signAndBroadcastStxTx(options?.ledgerTransport);
    }

    if (!rbfTransaction) {
      return;
    }

    if ((isLedgerAccount(selectedAccount) || isKeystoneAccount(selectedAccount)) && !options) {
      return;
    }

    try {
      setIsBroadcasting(true);
      const signedTx = await rbfTransaction.getReplacementTransaction({
        ...options,
        feeRate: Number(feeRateInput),
        context: transactionContext,
      });

      await btcClient.sendRawTransaction(signedTx.hex);

      toast.success(t('TX_FEE_UPDATED'));
      handleGoBack();
    } catch (err: any) {
      console.error(err);

      if (err?.response?.data) {
        if (err.response.data.includes('insufficient fee')) {
          toast.error(t('INSUFFICIENT_FEE'));
        }
      }
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleClickSubmit = async () => {
    if (!btcTransaction && !stxTransaction) {
      return;
    }

    if (isLedgerAccount(selectedAccount)) {
      setIsLedgerModalVisible(true);
      return;
    }

    if (isKeystoneAccount(selectedAccount)) {
      setIsKeystoneModalVisible(true);
      return;
    }

    signAndBroadcastTx();
  };

  const handleLedgerConnectAndConfirm = async () => {
    setIsHardwareWalletConnectButtonDisabled(true);

    const transport = await Transport.create();
    if (!transport) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsHardwareWalletConnectButtonDisabled(false);
      return;
    }

    setIsConnectSuccess(true);
    await delay(1500);
    setCurrentStepIndex(1);
    try {
      await signAndBroadcastTx({ ledgerTransport: transport });
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
    } finally {
      setIsHardwareWalletConnectButtonDisabled(false);
      await transport.close();
    }
  };

  const handleKeystoneConnectAndConfirm = async () => {
    setIsHardwareWalletConnectButtonDisabled(true);

    const transport = await createKeystoneTransport();
    if (!transport) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsHardwareWalletConnectButtonDisabled(false);
      return;
    }

    setIsConnectSuccess(true);
    await delay(1500);
    setCurrentStepIndex(1);
    try {
      await signAndBroadcastTx({ keystoneTransport: transport });
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
    } finally {
      setIsHardwareWalletConnectButtonDisabled(false);
      await transport.close();
    }
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  const cancelCallback = () => {
    setIsLedgerModalVisible(false);
    setIsKeystoneModalVisible(false);
    setIsConnectSuccess(false);
    setIsHardwareWalletConnectButtonDisabled(false);
  };

  const handleApplyCustomFee = (feeRate: string, fee: string) => {
    if (rbfTxSummary && Number(feeRate) < rbfTxSummary.minimumRbfFeeRate) {
      setCustomFeeError(t('FEE_TOO_LOW', { minimumFee: rbfTxSummary.minimumRbfFeeRate }));
      return;
    }

    if (customFeeError) {
      if (customFeeError === t('INSUFFICIENT_FUNDS')) {
        return;
      }

      setCustomFeeError(undefined);
    }

    setFeeRateInput(feeRate);
    setCustomFeeRate(feeRate);
    setCustomTotalFee(fee);
    setSelectedOption('custom');

    setShowCustomFee(false);
  };

  const handleCloseCustomFee = () => {
    setShowCustomFee(false);
  };

  const getEstimatedCompletionTime = (feeRate?: number) => {
    if (!feeRate || !mempoolFees) {
      return EMPTY_LABEL;
    }

    if (feeRate < mempoolFees.hourFee) {
      return isBtc ? t('TIME.SEVERAL_HOURS_OR_MORE') : `10+ ${t('TIME.MINUTES')}`;
    }

    if (feeRate === mempoolFees.hourFee) {
      return isBtc ? `~1 ${t('TIME.HOUR')}` : `10+ ${t('TIME.MINUTES')}`;
    }

    if (feeRate > mempoolFees.hourFee && feeRate <= mempoolFees.halfHourFee) {
      return isBtc ? `~30 ${t('TIME.MINUTES')}` : `~5 ${t('TIME.MINUTES')}`;
    }

    return isBtc ? `~10 ${t('TIME.MINUTES')}` : `~30 ${t('TIME.SECONDS')}`;
  };

  const iconProps = {
    size: 20,
    color: theme.colors.tangerine,
  };

  const feeButtonMapping = {
    medium: {
      icon: <CarProfile {...iconProps} />,
      title: t('MED_PRIORITY'),
    },
    high: {
      icon: <RocketLaunch {...iconProps} />,
      title: t('HIGH_PRIORITY'),
    },
    higher: {
      icon: <Lightning {...iconProps} />,
      title: t('HIGHER_PRIORITY'),
    },
    highest: {
      icon: <ShootingStar {...iconProps} />,
      title: t('HIGHEST_PRIORITY'),
    },
  };

  return (
    <>
      <TopRow onClick={handleGoBack} />
      {isLoading ? (
        <LoaderContainer>
          <Spinner color="white" size={30} />
        </LoaderContainer>
      ) : (
        <>
          {isBtc ? (
            <SpeedUpBtcTransaction
              rbfTxSummary={rbfTxSummary}
              rbfRecommendedFees={rbfRecommendedFees}
              selectedOption={selectedOption}
              customFeeRate={customFeeRate}
              customTotalFee={customTotalFee}
              feeButtonMapping={feeButtonMapping}
              handleGoBack={handleGoBack}
              handleClickFeeButton={handleClickFeeButton}
              handleClickSubmit={handleClickSubmit}
              getEstimatedCompletionTime={getEstimatedCompletionTime}
              isBroadcasting={isBroadcasting}
            />
          ) : (
            <SpeedUpStxTransaction
              rbfTxSummary={rbfTxSummary}
              rbfRecommendedFees={rbfRecommendedFees}
              selectedOption={selectedOption}
              customFeeRate={customFeeRate}
              customTotalFee={customTotalFee}
              feeButtonMapping={feeButtonMapping}
              handleGoBack={handleGoBack}
              handleClickFeeButton={handleClickFeeButton}
              handleClickSubmit={handleClickSubmit}
              getEstimatedCompletionTime={getEstimatedCompletionTime}
              isBroadcasting={isBroadcasting}
            />
          )}

          {rbfTxSummary && showCustomFee && (
            <CustomFee
              visible={showCustomFee}
              onClose={handleCloseCustomFee}
              minimumFeeRate={rbfTxSummary.minimumRbfFeeRate.toString()}
              initialTotalFee={rbfTxSummary.minimumRbfFee.toString()}
              feeRate={customFeeRate}
              fee={customTotalFee}
              isFeeLoading={false}
              error={customFeeError || ''}
              calculateTotalFee={calculateTotalFee}
              onClickApply={handleApplyCustomFee}
              isBtc={isBtc}
            />
          )}

          <Sheet visible={isLedgerModalVisible} onClose={() => setIsLedgerModalVisible(false)}>
            {currentStepIndex === 0 && (
              <LedgerConnectionView
                title={signatureRequestTranslate('LEDGER.CONNECT.TITLE')}
                text={signatureRequestTranslate('LEDGER.CONNECT.SUBTITLE', {
                  name: isBtc ? 'Bitcoin' : 'Stacks',
                })}
                titleFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE')}
                textFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_SUBTITLE')}
                imageDefault={isBtc ? ledgerConnectBtcIcon : ledgerConnectStxIcon}
                isConnectSuccess={isConnectSuccess}
                isConnectFailed={isConnectFailed}
              />
            )}
            {currentStepIndex === 1 && (
              <LedgerConnectionView
                title={signatureRequestTranslate('LEDGER.CONFIRM.TITLE')}
                text={signatureRequestTranslate('LEDGER.CONFIRM.SUBTITLE')}
                titleFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_TITLE')}
                textFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_SUBTITLE')}
                imageDefault={ledgerConnectDefaultIcon}
                isConnectSuccess={false}
                isConnectFailed={isTxRejected}
              />
            )}
            <SuccessActionsContainer>
              <Button
                onClick={
                  isTxRejected || isConnectFailed ? handleRetry : handleLedgerConnectAndConfirm
                }
                title={signatureRequestTranslate(
                  isTxRejected || isConnectFailed ? 'LEDGER.RETRY_BUTTON' : 'LEDGER.CONNECT_BUTTON',
                )}
                disabled={isHardwareWalletConnectButtonDisabled}
                loading={isHardwareWalletConnectButtonDisabled}
              />
              <Button
                onClick={cancelCallback}
                title={signatureRequestTranslate('LEDGER.CANCEL_BUTTON')}
                variant="secondary"
              />
            </SuccessActionsContainer>
          </Sheet>

          <Sheet visible={isKeystoneModalVisible} onClose={() => setIsKeystoneModalVisible(false)}>
            {currentStepIndex === 0 && (
              <KeystoneConnectionView
                title={signatureRequestTranslate('KEYSTONE.CONNECT.TITLE')}
                text={signatureRequestTranslate('KEYSTONE.CONNECT.SUBTITLE')}
                titleFailed={signatureRequestTranslate('KEYSTONE.CONNECT.ERROR_TITLE')}
                textFailed={signatureRequestTranslate('KEYSTONE.CONNECT.ERROR_SUBTITLE')}
                imageDefault={keystoneConnectBtcIcon}
                isConnectSuccess={isConnectSuccess}
                isConnectFailed={isConnectFailed}
              />
            )}
            {currentStepIndex === 1 && (
              <KeystoneConnectionView
                title={signatureRequestTranslate('KEYSTONE.CONFIRM.TITLE')}
                text={signatureRequestTranslate('KEYSTONE.CONFIRM.SUBTITLE')}
                titleFailed={signatureRequestTranslate('KEYSTONE.CONFIRM.ERROR_TITLE')}
                textFailed={signatureRequestTranslate('KEYSTONE.CONFIRM.ERROR_SUBTITLE')}
                imageDefault={keystoneConnectDefaultIcon}
                isConnectSuccess={false}
                isConnectFailed={isTxRejected}
              />
            )}
            <SuccessActionsContainer>
              <Button
                onClick={
                  isTxRejected || isConnectFailed ? handleRetry : handleKeystoneConnectAndConfirm
                }
                title={signatureRequestTranslate(
                  isTxRejected || isConnectFailed
                    ? 'KEYSTONE.RETRY_BUTTON'
                    : 'KEYSTONE.CONNECT_BUTTON',
                )}
                disabled={isHardwareWalletConnectButtonDisabled}
                loading={isHardwareWalletConnectButtonDisabled}
              />
              <Button
                onClick={cancelCallback}
                title={signatureRequestTranslate('KEYSTONE.CANCEL_BUTTON')}
                variant="secondary"
              />
            </SuccessActionsContainer>
          </Sheet>
        </>
      )}
    </>
  );
}

export default SpeedUpTransactionScreen;
