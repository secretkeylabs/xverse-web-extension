import styled, { useTheme } from 'styled-components';
import {
  FacebookShareButton, TwitterShareButton, EmailShareButton,
} from 'react-share';
import { useTranslation } from 'react-i18next';
import FBIcon from '@assets/img/nftDashboard/shareNft/facebook-f.svg';
import EmailIcon from '@assets/img/nftDashboard/shareNft/Envelope.svg';
import LinkIcon from '@assets/img/nftDashboard/shareNft/Link.svg';
import TwitterIcon from '@assets/img/nftDashboard/shareNft/Vector.svg';
import Cross from '@assets/img/dashboard/X.svg';
import ShareLinkRow from './shareLinkRow';

const Container = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  paddingLeft: props.theme.spacing(4),
  paddingRight: props.theme.spacing(4),
  paddingTop: props.theme.spacing(4),
  paddingBottom: props.theme.spacing(4),
  borderRadius: 12,
  width: 220,
  background: props.theme.colors.background.elevation2,
}));

const CrossContainer = styled.button(() => ({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  background: 'transparent',
  width: '100%',
  paddingRight: 4,
}));

interface Props {
  url: string;
  onCrossClick: () => void;
}
function ShareDialog({ url, onCrossClick }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const theme = useTheme();

  const onCopyPress = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <Container>
      <CrossContainer onClick={onCrossClick}>
        <img src={Cross} alt="cross" width={16} height={16} />
      </CrossContainer>
      <FacebookShareButton
        url={url}
      >
        <ShareLinkRow img={FBIcon} background="#4267B2" text={t('FACEBOOK')} />
      </FacebookShareButton>
      <TwitterShareButton
        url={url}
      >
        <ShareLinkRow img={TwitterIcon} background="#4D9FEB" text={t('TWITTER')} />
      </TwitterShareButton>
      <EmailShareButton url={url}>
        <ShareLinkRow img={EmailIcon} background="#4C5187" text={t('MAIL')} />
      </EmailShareButton>
      <ShareLinkRow onClick={onCopyPress} img={LinkIcon} background={theme.colors.white['400']} text={t('COPY')} />
    </Container>
  );
}

export default ShareDialog;
