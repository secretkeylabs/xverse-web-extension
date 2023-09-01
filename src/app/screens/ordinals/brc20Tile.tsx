import PlaceholderImage from '@assets/img/nftDashboard/nft_fallback.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import stc from 'string-to-color';
import styled from 'styled-components';

interface ContainerProps {
  isGalleryOpen: boolean;
  inNftDetail?: boolean;
  isSmallImage?: boolean;
}

const ImageContainer = styled.div<ContainerProps>(() => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  backgroundColor: '#1b1e2b',
  borderRadius: 8,
  flexDirection: 'column',
}));

const BRC20Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const OrdinalContentText = styled.h1<TextProps>((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
  fontSize: props.inNftSend || props.withoutSizeIncrease ? 15 : 'calc(0.8vw + 2vh)',
  overflow: 'hidden',
  textAlign: 'center',
}));

interface TextProps {
  inNftSend?: boolean;
  withoutSizeIncrease?: boolean;
}

const BRC20Text = styled.h1<TextProps>((props) => ({
  ...props.theme.body_bold_l,
  color: props.theme.colors.white_0,
  fontSize: props.inNftSend || props.withoutSizeIncrease ? 16 : 'calc(0.8vw + 2vh)',
  textAlign: 'center',
}));

interface TickerProps {
  enlargeTicker?: boolean;
}

const TickerIconContainer = styled.div<TickerProps>((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: props.enlargeTicker ? 50 : 34.65,
  width: props.enlargeTicker ? 50 : 34.65,
  marginTop: 3,
  marginBottom: 3,
  borderRadius: 50,
  backgroundColor: props.color,
}));

const TickerIconText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white_0,
  textAlign: 'center',
  wordBreak: 'break-all',
  fontSize: 10,
}));

const OrdinalsTag = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'rgba(39, 42, 68, 0.6)',
  borderRadius: 40,
  width: 79,
  height: 22,
  left: 12,
  bottom: 12,
  zIndex: 1000,
  position: 'absolute',
  padding: '3px 6px',
});
const ButtonIcon = styled.img({
  width: 12,
  height: 12,
});

const Text = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  textTransform: 'uppercase',
  color: props.theme.colors.white_0,
  fontSize: 10,
  marginLeft: props.theme.spacing(4),
}));

interface Brc20TileProps {
  brcContent: string;
  isNftDashboard?: boolean;
  inNftDetail?: boolean;
  isSmallImage?: boolean;
  isGalleryOpen: boolean;
  withoutSizeIncrease?: boolean;
}

export default function Brc20Tile(props: Brc20TileProps) {
  const {
    brcContent,
    isSmallImage,
    isNftDashboard,
    inNftDetail,
    isGalleryOpen,
    withoutSizeIncrease,
  } = props;
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  function renderFTIcon(ticker: string) {
    const background = stc(ticker.toUpperCase());
    ticker = ticker && ticker.substring(0, 4);
    return (
      <TickerIconContainer color={background} enlargeTicker={isGalleryOpen}>
        <TickerIconText>{ticker}</TickerIconText>
      </TickerIconContainer>
    );
  }

  try {
    const regex = /”/g;
    const validBrcContentValue = brcContent.replace(regex, '"');
    const content = JSON.parse(validBrcContentValue);

    const generateOrdinalContent = (type: 'MINT' | 'TRANSFER' | 'DEPLOY') => (
      <ImageContainer
        isSmallImage={isSmallImage}
        inNftDetail={inNftDetail}
        isGalleryOpen={isGalleryOpen}
      >
        <BRC20Container>
          <BRC20Text withoutSizeIncrease={withoutSizeIncrease}>{t(type)}</BRC20Text>
          {renderFTIcon(content?.tick)}
          {type !== 'DEPLOY' && (
            <NumericFormat
              value={content?.amt}
              displayType="text"
              thousandSeparator
              renderText={(text) => (
                <BRC20Text withoutSizeIncrease={withoutSizeIncrease}>{text}</BRC20Text>
              )}
            />
          )}
          {isNftDashboard && (
            <OrdinalsTag>
              <ButtonIcon src={OrdinalsIcon} />
              <Text>{t('ORDINAL')}</Text>
            </OrdinalsTag>
          )}
        </BRC20Container>
      </ImageContainer>
    );

    switch (content?.op) {
      case 'mint':
        return generateOrdinalContent('MINT');
      case 'transfer':
        return generateOrdinalContent('TRANSFER');
      case 'deploy':
        return generateOrdinalContent('DEPLOY');
      default:
        return (
          <ImageContainer isSmallImage={isSmallImage} isGalleryOpen={isGalleryOpen}>
            <img src={PlaceholderImage} alt="ordinal" />
          </ImageContainer>
        );
    }
  } catch (e) {
    return (
      <ImageContainer
        isSmallImage={isSmallImage}
        inNftDetail={inNftDetail}
        isGalleryOpen={isGalleryOpen}
      >
        <OrdinalContentText inNftSend={false} withoutSizeIncrease={withoutSizeIncrease}>
          {brcContent}
        </OrdinalContentText>
        {isNftDashboard && (
          <OrdinalsTag>
            <ButtonIcon src={OrdinalsIcon} />
            <Text>{t('ORDINAL')}</Text>
          </OrdinalsTag>
        )}
      </ImageContainer>
    );
  }
}
