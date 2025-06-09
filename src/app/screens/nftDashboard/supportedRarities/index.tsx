import TopRow from '@components/topRow';
import { ArrowUpRight } from '@phosphor-icons/react';
import { RodarmorRareSats, Satributes } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { BLOG_LINK, POPUP_WIDTH } from '@utils/constants';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Theme from 'theme';
import RarityTile from './rarityTile';

interface ContainerProps {
  isGallery?: boolean;
}

const ContentContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingRight: props.theme.spacing(8),
  paddingLeft: props.theme.spacing(8),
  paddingTop: props.theme.spacing(8),
  overflowY: 'auto',
  paddingBottom: props.theme.spacing(12),
  flex: 1,
}));
const TopText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(8),
}));

const TypesContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(6),
}));

const ButtonImage = styled.button((props) => ({
  backgroundColor: 'transparent',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(6),
}));

const Container = styled.div<ContainerProps>((props) => ({
  width: props.isGallery ? 580 : '100%',
}));

const MainContainer = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  backgroundColor: Theme.colors.elevation0,
}));

const rarityTypes = [...RodarmorRareSats, ...Satributes];

function SupportedRarities() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'RARE_SATS' });

  const isGalleryOpen: boolean = document.documentElement.clientWidth > POPUP_WIDTH;

  const openLearnMoreLink = () =>
    window.open(`${BLOG_LINK}/rare-satoshis`, '_blank', 'noopener,noreferrer');

  return (
    <MainContainer>
      <Container isGallery={isGalleryOpen}>
        <TopRow
          title={t('RARITY_DETAIL.SUPPORTED_RARITIES')}
          onClick={() => {
            navigate(-1);
          }}
        />
        <ContentContainer>
          <TopText>{t('RARITY_DETAIL.RARITY_INFO')}</TopText>
          <ButtonImage onClick={openLearnMoreLink}>
            <StyledP typography="body_medium_m" color="orange_main">
              {t('RARITY_DETAIL.LEARN_MORE')}
            </StyledP>
            <ArrowUpRight size="16" color={Theme.colors.tangerine} />
          </ButtonImage>

          <TypesContainer>
            {rarityTypes.map((type) => (
              <RarityTile type={type} key={type} />
            ))}
          </TypesContainer>
        </ContentContainer>
      </Container>
    </MainContainer>
  );
}
export default SupportedRarities;
