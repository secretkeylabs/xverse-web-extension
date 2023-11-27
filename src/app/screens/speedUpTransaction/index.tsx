import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/ledger/ledger_import_connect_btc.svg';
import { ledgerDelay } from '@common/utils/ledger';
import BottomModal from '@components/bottomModal';
import ActionButton from '@components/button';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import TopRow from '@components/topRow';
import useTransaction from '@hooks/queries/useTransaction';
import useBtcClient from '@hooks/useBtcClient';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import Transport from '@ledgerhq/hw-transport-webusb';
import { CarProfile, Faders, Lightning, RocketLaunch, ShootingStar } from '@phosphor-icons/react';
import { getBtcFiatEquivalent, rbf } from '@secretkeylabs/xverse-core';
import { Transport as TransportType } from '@secretkeylabs/xverse-core/ledger/types';
import type { RecommendedFeeResponse } from '@secretkeylabs/xverse-core/types/api/esplora';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import { isLedgerAccount } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useNavigate, useParams } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import styled, { useTheme } from 'styled-components';
import CustomFee from './customFee';

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

const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(8),
}));

const LoaderContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 'inherit',
});

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const DetailText = styled.span((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(4),
}));

const HighlightedText = styled.span((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${(props) => props.theme.spacing(6)}px;
  gap: ${(props) => props.theme.spacing(4)}px;
`;

const FeeButton = styled.button<{
  isSelected: boolean;
  centered?: boolean;
}>((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  color: props.theme.colors.white_0,
  backgroundColor: `${props.isSelected ? props.theme.colors.elevation6_600 : 'transparent'}`,
  border: `1px solid ${
    props.isSelected ? props.theme.colors.white_800 : props.theme.colors.white_850
  }`,
  borderRadius: props.theme.radius(2),
  height: 'auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: props.centered ? 'center' : 'flex-start',
  transition: 'background-color 0.1s ease-in-out, border 0.1s ease-in-out',
  padding: props.theme.spacing(8),
  paddingTop: props.theme.spacing(6),
  paddingBottom: props.theme.spacing(6),
  ':not(:disabled):hover': {
    borderColor: props.theme.colors.white_800,
  },
  ':disabled': {
    cursor: 'not-allowed',
    color: props.theme.colors.white_400,
    div: {
      color: 'inherit',
    },
    svg: {
      fill: props.theme.colors.white_600,
    },
  },
}));

const ControlsContainer = styled.div`
  display: flex;
  column-gap: 12px;
  margin: 38px 16px 40px;
`;

const CustomFeeIcon = styled(Faders)({
  transform: 'rotate(90deg)',
});

const FeeButtonLeft = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  gap: props.theme.spacing(6),
}));

const FeeButtonRight = styled.div({
  textAlign: 'right',
});

const SecondaryText = styled.div<{
  alignRight?: boolean;
}>((props) => ({
  ...props.theme.typography.body_medium_s,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(2),
  textAlign: props.alignRight ? 'right' : 'left',
}));

const StyledActionButton = styled(ActionButton)((props) => ({
  'div, h1': {
    ...props.theme.typography.body_medium_m,
  },
}));

const WarningText = styled.span((props) => ({
  ...props.theme.typography.body_medium_s,
  display: 'block',
  color: props.theme.colors.danger_light,
  marginTop: props.theme.spacing(2),
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
  const [totalFee, setTotalFee] = useState<string | undefined>();
  const [selectedOption, setSelectedOption] = useState<string | undefined>();
  const [recommendedFees, setRecommendedFees] = useState<RecommendedFeeResponse>();
  const [rbfRecommendedFees, setRbfRecommendedFees] = useState<RbfRecommendedFees>();
  const { data: transaction } = useTransaction(id!);
  const [rbfTransaction, setRbfTransaction] = useState<any>();
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [isTxApproved, setIsTxApproved] = useState(false);
  const [isTxRejected, setIsTxRejected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customFeeRate, setCustomFeeRate] = useState<string | undefined>();
  const [customFeeError, setCustomFeeError] = useState<string | undefined>();

  console.log('rbfTransaction', rbfTransaction);
  console.log('rbfRecommendedFees', rbfRecommendedFees);
  console.log('rbfTxSummary', rbfTxSummary);

  const fetchRbfData = async () => {
    if (!selectedAccount || !id || !transaction) {
      return;
    }

    try {
      if (!isLoading) {
        setIsLoading(true);
      }
      const rbfTx = new rbf.RbfTransaction(transaction, {
        ...selectedAccount,
        accountType: accountType || 'software',
        accountId:
          isLedgerAccount(selectedAccount) && selectedAccount.deviceAccountIndex
            ? selectedAccount.deviceAccountIndex
            : selectedAccount.id,
        network: network.type,
        // @ts-ignore
        seedVault,
      });
      setRbfTransaction(rbfTx);

      const rbfTransactionSummary = await rbf.getRbfTransactionSummary(transaction);
      setRbfTxSummary(rbfTransactionSummary);

      const mempoolFees = await btcClient.getRecommendedFees();
      setRecommendedFees(mempoolFees);

      const rbfRecommendedFeesResponse = await rbfTx.getRbfRecommendedFees(mempoolFees);
      setRbfRecommendedFees(rbfRecommendedFeesResponse);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRbfData();
  }, [selectedAccount, id, transaction]);

  const handleClickFeeButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.value === 'custom') {
      setShowCustomFee(true);
      return;
    }

    if (rbfRecommendedFees) {
      const feeObj = rbfRecommendedFees[e.currentTarget.value];

      if (feeObj?.enoughFunds) {
        setTotalFee(feeObj.fee);
        setFeeRateInput(feeObj.feeRate);
        setSelectedOption(e.currentTarget.value);
      }
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const signAndBroadcastTx = async (transport?: TransportType) => {
    if (isLedgerAccount(selectedAccount) && !transport) {
      return;
    }

    console.log('feeRateInput', feeRateInput);
    console.log('Signing tx...');
    const signedTx = await rbfTransaction.getReplacementTransaction({
      feeRate: Number(feeRateInput),
      ledgerTransport: transport,
    });
    console.log('signedTx', signedTx);

    const response = await btcClient.sendRawTransaction(signedTx.hex);
    const txId = response.tx.hash;
    console.log('txId', txId);

    toast.success(t('TX_FEE_UPDATED'));
    handleGoBack();
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

    setIsButtonDisabled(true);
    const transport = await Transport.create();
    if (!transport) {
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
    }

    setIsConnectSuccess(true);
    await ledgerDelay(1500);
    setCurrentStepIndex(1);
    try {
      const response = await signAndBroadcastTx(transport);
    } catch (err) {
      console.error(err);
      setIsTxRejected(true);
    } finally {
      await transport.close();
      setIsButtonDisabled(false);
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

  const handleApplyCustomFee = (feeRate: string) => {
    if (rbfTxSummary && Number(feeRate) < rbfTxSummary?.minimumRbfFeeRate) {
      setCustomFeeError(t('FEE_TOO_LOW', { minimumFee: rbfTxSummary?.minimumRbfFeeRate }));
      return;
    }

    if (customFeeError) {
      setCustomFeeError(undefined);
    }

    setFeeRateInput(feeRate);
    setCustomFeeRate(feeRate);
    setSelectedOption('custom');

    setShowCustomFee(false);
  };

  const getEstimatedCompletionTime = (feeRate?: number) => {
    if (!feeRate || !recommendedFees) {
      return '--';
    }

    if (feeRate < recommendedFees?.hourFee) {
      return 'several hours or more';
    }

    if (feeRate === recommendedFees?.hourFee) {
      return '~1 hour';
    }

    if (feeRate > recommendedFees?.hourFee && feeRate <= recommendedFees?.halfHourFee) {
      return '~30 mins';
    }

    return '~10 mins';
  };

  const feeButtonMapping = {
    medium: {
      icon: <CarProfile size={20} color={theme.colors.tangerine} />,
      title: t('MED_PRIORITY'),
    },
    high: {
      icon: <RocketLaunch size={20} color={theme.colors.tangerine} />,
      title: t('HIGH_PRIORITY'),
    },
    higher: {
      icon: <Lightning size={20} color={theme.colors.tangerine} />,
      title: t('HIGHER_PRIORITY'),
    },
    highest: {
      icon: <ShootingStar size={20} color={theme.colors.tangerine} />,
      title: t('HIGHEST_PRIORITY'),
    },
  };

  const getFiatAmountString = (fiatAmount: BigNumber) => {
    if (!fiatAmount) {
      return '';
    }

    if (fiatAmount.isLessThan(0.01)) {
      return `< ${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`;
    }

    return (
      <NumericFormat
        value={fiatAmount.toFixed(2).toString()}
        displayType="text"
        thousandSeparator
        prefix={`${currencySymbolMap[fiatCurrency]}`}
        suffix={` ${fiatCurrency}`}
        renderText={(value: string) => `~ ${value}`}
      />
    );
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
                  value={totalFee || rbfTxSummary?.currentFee}
                  displayType="text"
                  thousandSeparator
                  suffix=" Sats / "
                />
                <NumericFormat
                  value={feeRateInput || rbfTxSummary?.currentFeeRate}
                  displayType="text"
                  thousandSeparator
                  suffix=" Sats /vB"
                />
              </HighlightedText>
            </DetailText>
            <DetailText>
              {t('ESTIMATED_COMPLETION_TIME')}{' '}
              <HighlightedText>
                {getEstimatedCompletionTime(Number(feeRateInput) || rbfTxSummary?.currentFeeRate)}
              </HighlightedText>
            </DetailText>
            <ButtonContainer>
              {rbfRecommendedFees &&
                Object.entries(rbfRecommendedFees)
                  .sort((a, b) => {
                    const priorityOrder = ['highest', 'higher', 'high', 'medium'];
                    return priorityOrder.indexOf(a[0]) - priorityOrder.indexOf(b[0]);
                  })
                  .map(([key, obj]) => (
                    <FeeButton
                      key={key}
                      value={key}
                      isSelected={selectedOption === key}
                      onClick={handleClickFeeButton}
                      disabled={!obj.enoughFunds}
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
                            '--'
                          )}
                        </div>
                        {obj.fee ? (
                          <SecondaryText alignRight>
                            {getFiatAmountString(
                              getBtcFiatEquivalent(BigNumber(obj.fee), BigNumber(btcFiatRate)),
                            )}
                          </SecondaryText>
                        ) : (
                          <SecondaryText alignRight>-- {fiatCurrency}</SecondaryText>
                        )}
                        {!obj.enoughFunds && <WarningText>{t('INSUFFICIENT_FUNDS')}</WarningText>}
                      </FeeButtonRight>
                    </FeeButton>
                  ))}
              <FeeButton
                key="custom"
                value="custom"
                isSelected={selectedOption === 'custom'}
                onClick={handleClickFeeButton}
                centered={!customFeeRate}
              >
                <FeeButtonLeft>
                  <CustomFeeIcon size={20} color={theme.colors.tangerine} />
                  <div>
                    {t('CUSTOM')}
                    {customFeeRate && (
                      <SecondaryText>
                        <NumericFormat
                          value={customFeeRate}
                          displayType="text"
                          thousandSeparator
                          suffix=" Sats /vByte"
                        />
                      </SecondaryText>
                    )}
                  </div>
                </FeeButtonLeft>
                {customFeeRate ? (
                  <div>
                    <div>
                      <NumericFormat
                        value={totalFee || rbfTxSummary?.currentFee.toString()}
                        displayType="text"
                        thousandSeparator
                        suffix=" Sats"
                      />
                    </div>
                    <SecondaryText alignRight>
                      {getFiatAmountString(
                        getBtcFiatEquivalent(
                          BigNumber(totalFee || rbfTxSummary?.currentFee!),
                          BigNumber(btcFiatRate),
                        ),
                      )}
                    </SecondaryText>
                  </div>
                ) : (
                  <div>{t('MANUAL_SETTING')}</div>
                )}
              </FeeButton>
            </ButtonContainer>
          </Container>
          <ControlsContainer>
            <StyledActionButton text={t('CANCEL')} onPress={handleGoBack} transparent />
            <StyledActionButton
              text={t('SUBMIT')}
              disabled={!selectedOption}
              onPress={handleClickSubmit}
            />
          </ControlsContainer>

          <CustomFee
            visible={showCustomFee}
            onClose={() => setShowCustomFee(false)}
            initialFeeRate={feeRateInput || rbfTxSummary?.currentFeeRate.toString()!}
            fee={totalFee || rbfTxSummary?.currentFee.toString()!}
            isFeeLoading={false}
            error={customFeeError || ''}
            onClickApply={handleApplyCustomFee}
          />

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
                isConnectSuccess={isTxApproved}
                isConnectFailed={isTxRejected}
              />
            )}
            <SuccessActionsContainer>
              <ActionButton
                onPress={isTxRejected || isConnectFailed ? handleRetry : handleConnectAndConfirm}
                text={signatureRequestTranslate(
                  isTxRejected || isConnectFailed ? 'LEDGER.RETRY_BUTTON' : 'LEDGER.CONNECT_BUTTON',
                )}
                disabled={isButtonDisabled}
                processing={isButtonDisabled}
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
