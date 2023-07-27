import styled from 'styled-components';
import Copy from '@assets/img/nftDashboard/Copy.svg';
import Tick from '@assets/img/tick.svg';
import { useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { useTranslation } from 'react-i18next';

const Button = styled.button((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'transparent',
  marginLeft: props.theme.spacing(3),
  padding: 3,
  ':hover': {
    background: props.theme.colors.white[900],
    borderRadius: 24,
  },
}));

const Img = styled.img({
  width: 20,
  height: 20,
});

const StyledToolTip = styled(Tooltip)`
  background-color: #ffffff;
  color: #12151e;
  border-radius: 8px;
  padding: 7px;
`;

interface Props {
  text: string;
}
function CopyButton({ text }: Props) {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });

  const onCopyClick = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false);
      }, 5000);
    }
  }, [isCopied]);

  return (
    <>
      <Button id={`copy-${text}`} onClick={onCopyClick}>
        {isCopied ? <Img src={Tick} /> : <Img src={Copy} />}
      </Button>
      <StyledToolTip
        anchorId={`copy-${text}`}
        variant="light"
        content={t('COPIED')}
        events={['click']}
        place="top"
      />
    </>
  );
}

export default CopyButton;
