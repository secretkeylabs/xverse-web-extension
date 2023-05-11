import InfoContainer from '@components/infoContainer';
import { SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const NonceContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const DetailText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['200'],
  marginTop: props.theme.spacing(8),
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(8),
}));

const InputContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(6),
  border: `1px solid ${props.theme.colors.background.elevation6}`,
  backgroundColor: props.theme.colors.background.elevation1,
  borderRadius: 8,
  paddingLeft: props.theme.spacing(5),
  paddingRight: props.theme.spacing(5),
  paddingTop: props.theme.spacing(5),
  paddingBottom: props.theme.spacing(5),
}));

const InputField = styled.input((props) => ({
  ...props.theme.body_m,
  backgroundColor: props.theme.colors.background.elevation1,
  color: props.theme.colors.white['400'],
  width: '100%',
  border: 'transparent',
}));

interface Props {
  nonce: string;
  setNonce: (nonce: string) => void;
}
function EditNonce({ nonce, setNonce }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'TRANSACTION_SETTING' });
  const [nonceInput, setNonceInput] = useState(nonce);
  const onInputEditNonceChange = (e: { target: { value: SetStateAction<string> } }) => {
    setNonceInput(e.target.value);
  };

  useEffect(() => {
    setNonce(nonceInput);
  }, [nonceInput]);

  return (
    <NonceContainer>
      <DetailText>{t('NONCE_INFO')}</DetailText>
      <Text>{t('NONCE')}</Text>
      <InputContainer>
        <InputField value={nonceInput} onChange={onInputEditNonceChange} placeholder="0" />
      </InputContainer>
      <InfoContainer bodyText={t('NONCE_WARNING')} />
    </NonceContainer>
  );
}

export default EditNonce;
