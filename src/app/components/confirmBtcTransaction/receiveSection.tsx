import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowRight } from '@phosphor-icons/react';
import { btcTransaction } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';
import Amount from './itemRow/amount';
import InscriptionSatributeRow from './itemRow/inscriptionSatributeRow';
import { getOutputsWithAssetsToUserAddress } from './utils';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: `${props.theme.space.m} 0`,
  justifyContent: 'center',
  marginBottom: props.theme.space.s,
}));

const RowCenter = styled.div<{ spaceBetween?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: props.spaceBetween ? 'space-between' : 'initial',
}));

const Header = styled(RowCenter)((props) => ({
  marginBottom: props.theme.space.m,
  padding: `0 ${props.theme.space.m}`,
}));

const RowContainer = styled.div((props) => ({
  padding: `0 ${props.theme.space.m}`,
}));
const AddressLabel = styled(StyledP)((props) => ({
  marginLeft: props.theme.space.xxs,
}));

type Props = {
  outputs: btcTransaction.EnhancedOutput[];
  netAmount: number;
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
};
function ReceiveSection({ outputs, netAmount, onShowInscription }: Props) {
  const { btcAddress, ordinalsAddress, hasActivatedRareSatsKey } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  const { outputsToPayment, outputsToOrdinal } = getOutputsWithAssetsToUserAddress({
    outputs,
    btcAddress,
    ordinalsAddress,
  });

  const inscriptionsRareSatsInPayment = outputsToPayment.filter(
    (output) =>
      output.inscriptions.length > 0 || (hasActivatedRareSatsKey && output.satributes.length > 0),
  );
  const areInscriptionsRareSatsInPayment = inscriptionsRareSatsInPayment.length > 0;
  const amountIsBiggerThanZero = netAmount > 0;
  const showPaymentSection = areInscriptionsRareSatsInPayment || amountIsBiggerThanZero;

  return (
    <>
      {!!outputsToOrdinal.length && (
        <Container>
          <Header spaceBetween>
            <StyledP typography="body_medium_m" color="white_200">
              {t('YOU_WILL_RECEIVE')}
            </StyledP>
            <RowCenter>
              <ArrowRight weight="bold" color={Theme.colors.white_0} size={16} />
              <AddressLabel typography="body_medium_m">{t('YOUR_ORDINAL_ADDRESS')}</AddressLabel>
            </RowCenter>
          </Header>
          {outputsToOrdinal
            .sort((a, b) => b.inscriptions.length - a.inscriptions.length)
            .map((output, index) => (
              <InscriptionSatributeRow
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                inscriptions={output.inscriptions}
                satributes={output.satributes}
                amount={output.amount}
                onShowInscription={onShowInscription}
                showBottomDivider={outputsToOrdinal.length > index + 1}
              />
            ))}
        </Container>
      )}
      {showPaymentSection && (
        <Container>
          <Header spaceBetween>
            <StyledP typography="body_medium_m" color="white_200">
              {t('YOU_WILL_RECEIVE')}
            </StyledP>
            <RowCenter>
              <ArrowRight weight="bold" color={Theme.colors.white_0} size={16} />
              <AddressLabel typography="body_medium_m">{t('YOUR_PAYMENT_ADDRESS')}</AddressLabel>
            </RowCenter>
          </Header>
          {amountIsBiggerThanZero && (
            <RowContainer>
              <Amount amount={netAmount} />
            </RowContainer>
          )}
          {inscriptionsRareSatsInPayment
            .sort((a, b) => b.inscriptions.length - a.inscriptions.length)
            .map((output, index) => (
              <InscriptionSatributeRow
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                inscriptions={output.inscriptions}
                satributes={output.satributes}
                amount={output.amount}
                onShowInscription={onShowInscription}
                showTopDivider={amountIsBiggerThanZero && index === 0}
                showBottomDivider={inscriptionsRareSatsInPayment.length > index + 1}
              />
            ))}
        </Container>
      )}
    </>
  );
}

export default ReceiveSection;
