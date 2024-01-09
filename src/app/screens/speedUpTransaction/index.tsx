import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/ledger/ledger_import_connect_btc.svg';
import { delay } from '@common/utils/ledger';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import FiatAmountText from '@components/fiatAmountText';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import TopRow from '@components/topRow';
import useTransaction from '@hooks/queries/useTransaction';
import useBtcClient from '@hooks/useBtcClient';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { CarProfile, Lightning, RocketLaunch, ShootingStar } from '@phosphor-icons/react';
import {
  getBtcFiatEquivalent,
  mempoolApi,
  rbf,
  RecommendedFeeResponse,
  Transport as TransportType,
} from '@secretkeylabs/xverse-core';
import { EMPTY_LABEL } from '@utils/constants';
import { isLedgerAccount } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useNavigate, useParams } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import { useTheme } from 'styled-components';
import CustomFee from './customFee';
import {
  ButtonContainer,
  Container,
  ControlsContainer,
  CustomFeeIcon,
  DetailText,
  FeeButton,
  FeeButtonLeft,
  FeeButtonRight,
  HighlightedText,
  LoaderContainer,
  SecondaryText,
  StyledActionButton,
  SuccessActionsContainer,
  Title,
  WarningText,
} from './index.styled';

type TierFees = {
  enoughFunds: boolean;
  fee?: number;
  feeRate: number;
};

type RbfRecommendedFees = {
  medium?: TierFees;
  high?: TierFees;
  higher?: TierFees;
  highest?: TierFees;
};

function SpeedUpTransactionScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SPEED_UP_TRANSACTION' });
  const theme = useTheme();
  const navigate = useNavigate();
  const [showCustomFee, setShowCustomFee] = useState(false);
  const { selectedAccount, accountType, network, btcFiatRate, fiatCurrency } = useWalletSelector();
  const seedVault = useSeedVault();
  const { id } = useParams();
  const btcClient = useBtcClient();
  const [rbfTxSummary, setRbfTxSummary] = useState<{
    currentFee: number;
    currentFeeRate: number;
    minimumRbfFee: number;
    minimumRbfFeeRate: number;
  }>();
  const [feeRateInput, setFeeRateInput] = useState<string | undefined>();
  const [selectedOption, setSelectedOption] = useState<string | undefined>();
  const [recommendedFees, setRecommendedFees] = useState<RecommendedFeeResponse>();
  const [rbfRecommendedFees, setRbfRecommendedFees] = useState<RbfRecommendedFees>();
  const { data: transaction } = useTransaction(id!);
  const [rbfTransaction, setRbfTransaction] = useState<
    InstanceType<typeof rbf.RbfTransaction> | undefined
  >();
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLedgerConnectButtonDisabled, setIsLedgerConnectButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customFeeRate, setCustomFeeRate] = useState<string | undefined>();
  const [customTotalFee, setCustomTotalFee] = useState<string | undefined>();
  const [customFeeError, setCustomFeeError] = useState<string | undefined>();

  /* TODO: Move `fetchRbfData` function logic to a separate hook like
    const useRbfTransactionData: (transaction: ReturnType<useTransaction>) => {
      rbfTransaction?: rbf.RbfTransaction,
      rbfTxSummary?: {
        currentFee: number;
        currentFeeRate: number;
        minimumRbfFee: number;
        minimumRbfFeeRate: number;
      },
      rbfRecommendedFees?: RbfRecommendedFees
    } => { // logic here }
  */
  const fetchRbfData = useCallback(async () => {
    if (!selectedAccount || !id || !transaction) {
      return;
    }

    try {
      setIsLoading(true);
      const rbfTx = new rbf.RbfTransaction(transaction, {
        ...selectedAccount,
        accountType: accountType || 'software',
        accountId:
          isLedgerAccount(selectedAccount) && selectedAccount.deviceAccountIndex
            ? selectedAccount.deviceAccountIndex
            : selectedAccount.id,
        network: network.type,
        esploraProvider: btcClient,
        seedVault,
      });
      setRbfTransaction(rbfTx);

      const rbfTransactionSummary = await rbf.getRbfTransactionSummary(btcClient, transaction.txid);
      setRbfTxSummary(rbfTransactionSummary);

      const mempoolFees = await mempoolApi.getRecommendedFees(network.type);
      setRecommendedFees(mempoolFees);

      const rbfRecommendedFeesResponse = await rbfTx.getRbfRecommendedFees(mempoolFees);
      setRbfRecommendedFees(
        Object.fromEntries(
          Object.entries(rbfRecommendedFeesResponse).sort((a, b) => {
            const priorityOrder = ['highest', 'higher', 'high', 'medium'];
            return priorityOrder.indexOf(a[0]) - priorityOrder.indexOf(b[0]);
          }),
        ),
      );
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, id, transaction, accountType, network.type, seedVault, btcClient]);

  useEffect(() => {
    fetchRbfData();
  }, [fetchRbfData]);

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

  const calculateTotalFee = async (feeRate: string) => {
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

  const signAndBroadcastTx = async (transport?: TransportType) => {
    if (!rbfTransaction) {
      return;
    }

    if (isLedgerAccount(selectedAccount) && !transport) {
      return;
    }

    try {
      const signedTx = await rbfTransaction.getReplacementTransaction({
        feeRate: Number(feeRateInput),
        ledgerTransport: transport,
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
    }
  };

  const handleClickSubmit = async () => {
    if (!selectedAccount || !id) {
      return;
    }

    if (isLedgerAccount(selectedAccount)) {
      setIsModalVisible(true);
      return;
    }

    signAndBroadcastTx();
  };

  const handleConnectAndConfirm = async () => {
    if (!selectedAccount) {
      console.error('No account selected');
      return;
    }

    setIsLedgerConnectButtonDisabled(true);
    const transport = await Transport.create();
    if (!transport) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsLedgerConnectButtonDisabled(false);
      return;
    }

    setIsConnectSuccess(true);
    await delay(1500);
    setCurrentStepIndex(1);
    try {
      await signAndBroadcastTx(transport);
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
    } finally {
      await transport.close();
      setIsLedgerConnectButtonDisabled(false);
    }
  };

  const handleRetry = async () => {
    setIsTxRejected(false);
    setIsConnectSuccess(false);
    setCurrentStepIndex(0);
  };

  const cancelCallback = () => {
    setIsModalVisible(false);
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
    if (!feeRate || !recommendedFees) {
      return EMPTY_LABEL;
    }

    if (feeRate < recommendedFees.hourFee) {
      return t('TIME.SEVERAL_HOURS_OR_MORE');
    }

    if (feeRate === recommendedFees.hourFee) {
      return `~1 ${t('TIME.HOUR')}`;
    }

    if (feeRate > recommendedFees.hourFee && feeRate <= recommendedFees.halfHourFee) {
      return `~30 ${t('TIME.MINUTES')}`;
    }

    return `~10 ${t('TIME.MINUTES')}`;
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
      <TopRow title="" onClick={handleGoBack} />
      {isLoading ? (
        <LoaderContainer>
          <MoonLoader color="white" size={30} />
        </LoaderContainer>
      ) : (
        <>
          <Container>
            <Title>{t('TITLE')}</Title>
            <DetailText>{t('FEE_INFO')}</DetailText>
            <DetailText>
              {t('CURRENT_FEE')}{' '}
              <HighlightedText>
                <NumericFormat
                  value={rbfTxSummary?.currentFee}
                  displayType="text"
                  thousandSeparator
                  suffix=" Sats / "
                />
                <NumericFormat
                  value={rbfTxSummary?.currentFeeRate}
                  displayType="text"
                  thousandSeparator
                  suffix=" Sats /vB"
                />
              </HighlightedText>
            </DetailText>
            <DetailText>
              {t('ESTIMATED_COMPLETION_TIME')}{' '}
              <HighlightedText>
                {getEstimatedCompletionTime(rbfTxSummary?.currentFeeRate)}
              </HighlightedText>
            </DetailText>
            <ButtonContainer>
              {rbfRecommendedFees &&
                Object.entries(rbfRecommendedFees).map(([key, obj]) => {
                  const isDisabled = !obj.enoughFunds;

                  return (
                    <FeeButton
                      key={key}
                      value={key}
                      isSelected={selectedOption === key}
                      onClick={handleClickFeeButton}
                      disabled={isDisabled}
                    >
                      <FeeButtonLeft>
                        {feeButtonMapping[key].icon}
                        <div>
                          {feeButtonMapping[key].title}
                          <SecondaryText>{getEstimatedCompletionTime(obj.feeRate)}</SecondaryText>
                          <SecondaryText>
                            <NumericFormat
                              value={obj.feeRate}
                              displayType="text"
                              thousandSeparator
                              suffix=" Sats /vByte"
                            />
                          </SecondaryText>
                        </div>
                      </FeeButtonLeft>
                      <FeeButtonRight>
                        <div>
                          {obj.fee ? (
                            <NumericFormat
                              value={obj.fee}
                              displayType="text"
                              thousandSeparator
                              suffix=" Sats"
                            />
                          ) : (
                            EMPTY_LABEL
                          )}
                        </div>
                        <SecondaryText alignRight>
                          {obj.fee ? (
                            <FiatAmountText
                              fiatAmount={getBtcFiatEquivalent(
                                BigNumber(obj.fee),
                                BigNumber(btcFiatRate),
                              )}
                              fiatCurrency={fiatCurrency}
                            />
                          ) : (
                            `${EMPTY_LABEL} ${fiatCurrency}`
                          )}
                        </SecondaryText>
                        {isDisabled && <WarningText>{t('INSUFFICIENT_FUNDS')}</WarningText>}
                      </FeeButtonRight>
                    </FeeButton>
                  );
                })}
              <FeeButton
                key="custom"
                value="custom"
                isSelected={selectedOption === 'custom'}
                onClick={handleClickFeeButton}
                centered={!customFeeRate}
              >
                <FeeButtonLeft>
                  <CustomFeeIcon {...iconProps} />
                  <div>
                    {t('CUSTOM')}
                    {customFeeRate && (
                      <>
                        <SecondaryText>
                          {getEstimatedCompletionTime(Number(customFeeRate))}
                        </SecondaryText>
                        <SecondaryText>
                          <NumericFormat
                            value={customFeeRate}
                            displayType="text"
                            thousandSeparator
                            suffix=" Sats /vByte"
                          />
                        </SecondaryText>
                      </>
                    )}
                  </div>
                </FeeButtonLeft>
                {customFeeRate && customTotalFee ? (
                  <div>
                    <div>
                      <NumericFormat
                        value={customTotalFee}
                        displayType="text"
                        thousandSeparator
                        suffix=" Sats"
                      />
                    </div>
                    <SecondaryText alignRight>
                      <FiatAmountText
                        fiatAmount={getBtcFiatEquivalent(
                          BigNumber(customTotalFee),
                          BigNumber(btcFiatRate),
                        )}
                        fiatCurrency={fiatCurrency}
                      />
                    </SecondaryText>
                  </div>
                ) : (
                  <div>{t('MANUAL_SETTING')}</div>
                )}
              </FeeButton>
            </ButtonContainer>
            <ControlsContainer>
              <StyledActionButton text={t('CANCEL')} onPress={handleGoBack} transparent />
              <StyledActionButton
                text={t('SUBMIT')}
                disabled={!selectedOption}
                onPress={handleClickSubmit}
              />
            </ControlsContainer>
          </Container>

          {/* TODO: Move this modal and the custom option info above to a separate component */}
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
            />
          )}

          <BottomModal header="" visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
            {currentStepIndex === 0 && (
              <LedgerConnectionView
                title={signatureRequestTranslate('LEDGER.CONNECT.TITLE')}
                text={signatureRequestTranslate('LEDGER.CONNECT.SUBTITLE', { name: 'Bitcoin' })}
                titleFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE')}
                textFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_SUBTITLE')}
                imageDefault={ledgerConnectBtcIcon}
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
              <ActionButton
                onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
                text={signatureRequestTranslate(
                  isTxRejected || isConnectFailed ? 'LEDGER.RETRY_BUTTON' : 'LEDGER.CONNECT_BUTTON',
                )}
                disabled={isLedgerConnectButtonDisabled}
                processing={isLedgerConnectButtonDisabled}
              />
              <ActionButton
                onPress={cancelCallback}
                text={signatureRequestTranslate('LEDGER.CANCEL_BUTTON')}
                transparent
              />
            </SuccessActionsContainer>
          </BottomModal>
        </>
      )}
    </>
  );
}

export default SpeedUpTransactionScreen;
