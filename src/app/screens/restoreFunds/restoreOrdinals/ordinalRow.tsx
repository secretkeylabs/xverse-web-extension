import useInscriptionDetails from '@hooks/queries/ordinals/useInscriptionDetails';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import { BtcOrdinal, Inscription } from '@secretkeylabs/xverse-core/types';
import { useTranslation } from 'react-i18next';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';

const OrdinalCard = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: props.theme.colors.background.elevation1,
  borderRadius: 8,
  padding: '16px 12px',
}));

const OrdinalImageContainer = styled.div((props) => ({
  width: 48,
  height: 48,
  background: props.theme.colors.background.elevation2,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white[400],
}));

const TransferButton = styled.button((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white[0],
  background: 'transparent',
  width: 86,
  border: `1px solid ${props.theme.colors.background.elevation6}`,
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
  isLoading: boolean;
  disableTransfer: boolean;
  handleOrdinalTransfer: (ordinal: BtcOrdinal, ordinalData: Inscription) => Promise<void>;
}

function OrdinalRow({ ordinal, isLoading, disableTransfer, handleOrdinalTransfer }: Props) {
  const { t } = useTranslation('translation');
  const ordinalData = useInscriptionDetails(ordinal.id);

  const onClick = async () => {
    if (ordinalData && ordinalData.data) {
      await handleOrdinalTransfer(ordinal, ordinalData.data);
    }
  };

  return (
    <OrdinalCard>
      <OrdinalImageContainer>
        <OrdinalImage isSmallImage withoutSizeIncrease ordinal={ordinalData?.data!} />
      </OrdinalImageContainer>

      <ColumnContainer>
        <TitleText>{`Inscription ${ordinalData?.data?.number}`}</TitleText>
        <ValueText>Ordinal</ValueText>
      </ColumnContainer>
      <ButtonContainer>
        <TransferButton onClick={onClick} disabled={disableTransfer}>
          {isLoading ? (
            <LoaderContainer>
              <MoonLoader color="white" size={15} />
            </LoaderContainer>
          ) : (
            t('RESTORE_ORDINAL_SCREEN.TRANSFER')
          )}
        </TransferButton>
      </ButtonContainer>
    </OrdinalCard>
  );
}

export default OrdinalRow;
