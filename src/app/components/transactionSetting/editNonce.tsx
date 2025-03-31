import Callout from '@ui-library/callout';
import Input from '@ui-library/input';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const Description = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.l,
}));

type Props = {
  nonce: string;
  setNonce: (nonce: string) => void;
};

function EditNonce({ nonce, setNonce }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'TRANSACTION_SETTING' });
  const [nonceInput, setNonceInput] = useState(nonce);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNonceInput(e.target.value);
  };

  useEffect(() => {
    setNonce(nonceInput);
  }, [nonceInput, setNonce]);

  return (
    <Container>
      <Description>{t('NONCE_INFO')}</Description>
      <Input
        titleElement={t('NONCE')}
        value={nonceInput}
        onChange={handleOnChange}
        placeholder="0"
        hideClear
        autoFocus
        bgColor={Theme.colors.elevation2}
      />
      <br />
      <Callout bodyText={t('NONCE_WARNING')} />
    </Container>
  );
}

export default EditNonce;
