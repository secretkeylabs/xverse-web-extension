import ActionButton from '@components/button';

import BigNumber from 'bignumber.js';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

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

interface Props {
  loading: boolean;
  onCancelClick: () => void;
  onConfirmClick: () => void;
  children: ReactNode;
  title?: string;
  subTitle?: string;
}

function ConfirmAddStakedBitcoinComponent({
  loading,
  children,
  title,
  subTitle,
  onConfirmClick,
  onCancelClick,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });
  const [buttonLoading, setButtonLoading] = useState(loading);

  useEffect(() => {
    setButtonLoading(loading);
  }, [loading]);

  const onConfirmButtonClick = async () => {
    onConfirmClick();
  };

  return (
    <>
      <Container>
        <TitleContainer>
          {!!subTitle && <RequestedByText>{subTitle}</RequestedByText>}
        </TitleContainer>

        {children}
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
    </>
  );
}

export default ConfirmAddStakedBitcoinComponent;
