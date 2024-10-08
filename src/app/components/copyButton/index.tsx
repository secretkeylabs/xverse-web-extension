import Copy from '@assets/img/nftDashboard/Copy.svg';
import Tick from '@assets/img/tick.svg';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';

const Button = styled.button((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'transparent',
  marginLeft: props.theme.spacing(3),
  padding: 3,
  borderRadius: props.theme.radius(5),
  ':hover': {
    background: props.theme.colors.white_900,
  },
}));

const Img = styled.img({
  width: 20,
  height: 20,
});

const StyledTooltip = styled(Tooltip)`
  background-color: ${(props) => props.theme.colors.white_0};
  color: #12151e;
  border-radius: 8px;
  padding: 7px;
`;

type Props = {
  text: string;
};

function CopyButton({ text }: Props) {
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });

  const onCopyClick = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }, [isCopied]);

  return (
    <>
      <Button id={`copy-${text}`} onClick={onCopyClick}>
        {isCopied ? <Img src={Tick} /> : <Img src={Copy} />}
      </Button>
      <StyledTooltip
        anchorId={`copy-${text}`}
        variant="light"
        content={t('COPIED')}
        events={['click']}
        place="top"
        hidden={!isCopied}
      />
    </>
  );
}

export default CopyButton;
