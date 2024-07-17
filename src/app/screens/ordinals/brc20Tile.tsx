import PlaceholderImage from '@assets/img/nftDashboard/nft_fallback.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import type { Brc20Definition } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import stc from 'string-to-color';
import styled from 'styled-components';

interface ContainerProps {
  isGalleryOpen: boolean;
  inNftDetail?: boolean;
  isSmallImage?: boolean;
}

const ImageContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  backgroundColor: props.theme.colors.elevation1,
  borderRadius: 8,
  flexDirection: 'column',
  '> img': {
    width: '100%',
  },
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
  isSmallImage?: boolean;
}

const BRC20Text = styled.h1<TextProps>((props) => {
  let fontSize = 'calc(0.8vw + 2vh)';
  if (props.isSmallImage) {
    fontSize = '0.625rem';
  } else if (props.inNftSend || props.withoutSizeIncrease) {
    fontSize = '1rem';
  }

  return {
    ...props.theme.body_bold_l,
    color: props.theme.colors.white[0],
    fontSize,
    textAlign: 'center',
  };
});

interface TickerProps {
  enlargeTicker?: boolean;
  isSmallImage?: boolean;
  isGalleryOpen?: boolean;
}

const TickerIconContainer = styled.div<TickerProps>((props) => {
  let size = 34.65;
  if (props.isSmallImage) {
    size = 25;
  } else if (props.isGalleryOpen && props.enlargeTicker) {
    size = 80;
  } else if (props.isGalleryOpen || props.enlargeTicker) {
    size = 56;
  }

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: size,
    width: size,
    marginTop: 3,
    marginBottom: 3,
    borderRadius: 50,
    backgroundColor: props.color,
  };
});

const TickerIconText = styled.h1<{
  enlargeTicker?: boolean;
  isGalleryOpen?: boolean;
}>((props) => {
  let fontSize = '0.625rem';
  if (props.enlargeTicker && props.isGalleryOpen) {
    fontSize = '1.25rem';
  } else if (props.enlargeTicker || props.isGalleryOpen) {
    fontSize = '0.875rem';
  }

  return {
    ...props.theme.body_bold_m,
    color: props.theme.colors.white['0'],
    textAlign: 'center',
    wordBreak: 'break-all',
    fontSize,
  };
});

const OrdinalsTag = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  background: props.theme.colors.elevation1,
  borderRadius: 40,
  width: 79,
  height: 22,
  left: 12,
  bottom: 12,
  zIndex: 1000,
  position: 'absolute',
  padding: '3px 6px',
}));
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
  brcContent: Brc20Definition;
  isNftDashboard?: boolean;
  inNftDetail?: boolean;
  isSmallImage?: boolean;
  isGalleryOpen: boolean;
  withoutSizeIncrease?: boolean;
  withoutTitles?: boolean;
}

export default function Brc20Tile(props: Brc20TileProps) {
  const {
    brcContent,
    isSmallImage,
    isNftDashboard,
    inNftDetail,
    isGalleryOpen,
    withoutSizeIncrease,
    withoutTitles,
  } = props;
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const renderFTIcon = (ticker: string) => {
    const background = stc(ticker.toUpperCase());
    ticker = ticker && ticker.substring(0, 4);
    return (
      <TickerIconContainer
        color={background}
        enlargeTicker={withoutTitles}
        isGalleryOpen={isGalleryOpen}
        isSmallImage={isSmallImage}
      >
        <TickerIconText enlargeTicker={withoutTitles} isGalleryOpen={isGalleryOpen}>
          {ticker}
        </TickerIconText>
      </TickerIconContainer>
    );
  };

  try {
    const generateOrdinalContent = (type: 'MINT' | 'TRANSFER' | 'DEPLOY') => (
      <ImageContainer
        isSmallImage={isSmallImage}
        inNftDetail={inNftDetail}
        isGalleryOpen={isGalleryOpen}
      >
        <BRC20Container>
          {!withoutTitles && (
            <BRC20Text withoutSizeIncrease={withoutSizeIncrease} isSmallImage={isSmallImage}>
              {t(type)}
            </BRC20Text>
          )}
          {renderFTIcon(brcContent?.tick)}
          {!withoutTitles && type !== 'DEPLOY' && (
            <NumericFormat
              value={brcContent?.value}
              displayType="text"
              thousandSeparator
              renderText={(text) => (
                <BRC20Text withoutSizeIncrease={withoutSizeIncrease} isSmallImage={isSmallImage}>
                  {text}
                </BRC20Text>
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

    switch (brcContent?.op) {
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
          {JSON.stringify(brcContent)}
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
