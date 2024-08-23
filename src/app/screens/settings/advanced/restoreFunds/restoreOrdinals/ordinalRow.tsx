import useInscriptionDetails from '@hooks/queries/ordinals/useInscriptionDetails';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import type { BtcOrdinal } from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const OrdinalCard = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: props.theme.colors.elevation1,
  borderRadius: 8,
  padding: '16px 12px',
}));

const OrdinalImageContainer = styled.div((props) => ({
  width: 48,
  height: 48,
  background: props.theme.colors.elevation2,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white_400,
}));

const TransferButton = styled.button((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white_0,
  background: 'transparent',
  width: 86,
  border: `1px solid ${props.theme.colors.elevation6}`,
  borderRadius: 8,
  padding: '12px 16px',
}));

const ButtonContainer = styled.div({
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-end',
});

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginLeft: 12,
});

const LoaderContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

interface Props {
  ordinal: BtcOrdinal;
  feeRate: string;
  isLoading: boolean;
  disableTransfer: boolean;
  handleOrdinalTransfer: (ordinal: BtcOrdinal, feeRate: string) => Promise<void>;
}

function OrdinalRow({
  ordinal,
  feeRate,
  isLoading,
  disableTransfer,
  handleOrdinalTransfer,
}: Props) {
  const { t } = useTranslation('translation');
  const { data: ordinalData, isLoading: isQuerying } = useInscriptionDetails(ordinal.id);

  if (!isQuerying && ordinalData) {
    return (
      <OrdinalCard>
        <OrdinalImageContainer>
          <OrdinalImage isSmallImage withoutSizeIncrease ordinal={ordinalData} />
        </OrdinalImageContainer>
        <ColumnContainer>
          <TitleText>{`Inscription ${ordinalData.number}`}</TitleText>
          <ValueText>Ordinal</ValueText>
        </ColumnContainer>
        <ButtonContainer>
          <TransferButton
            onClick={() => handleOrdinalTransfer(ordinal, feeRate)}
            disabled={disableTransfer}
          >
            {isLoading ? (
              <LoaderContainer>
                <Spinner color="white" size={15} />
              </LoaderContainer>
            ) : (
              t('RESTORE_ORDINAL_SCREEN.TRANSFER')
            )}
          </TransferButton>
        </ButtonContainer>
      </OrdinalCard>
    );
  }
}

export default OrdinalRow;
