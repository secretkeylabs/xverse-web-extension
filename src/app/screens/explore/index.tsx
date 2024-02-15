import FeaturedCardCarousel from '@components/explore/FeaturedCarousel';
import RecommendedApps from '@components/explore/RecommendedApps';
import SwiperNavigation from '@components/explore/SwiperNavigation';
import BottomBar from '@components/tabBar';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowsOut } from '@phosphor-icons/react';
import { FeaturedDapp, getFeaturedDapps } from '@secretkeylabs/xverse-core';
import { StyledHeading } from '@ui-library/common.styled';
import { XVERSE_EXPLORE_URL } from '@utils/constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: props.theme.space.xs,
  paddingTop: props.theme.space.xxl,
  paddingBottom: props.theme.space.xl,
  color: props.theme.colors.white_0,
}));

const Subheader = styled.div`
  ${({ theme }) => theme.headline_category_m};
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.space.xl};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.white_200};
`;

const ExternalLink = styled.a`
  ${({ theme }) => theme.typography.body_medium_m};
  display: flex;
  align-items: center;
  column-gap: ${({ theme }) => theme.space.xs};
  color: ${({ theme }) => theme.colors.white_0};
  margin-top: ${({ theme }) => theme.space.s};
  cursor: pointer;
`;

function ExploreScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'EXPLORE_SCREEN' });
  const { network } = useWalletSelector();
  const [featuredApps, setFeaturedApps] = useState<FeaturedDapp[]>();
  const [recommendedApps, setRecommendedApps] = useState<FeaturedDapp[]>();

  const fetchFeaturedApps = async () => {
    const response = await getFeaturedDapps(network.type);

    const featured = response.find((f) => f.section === 'Featured')?.apps;
    const recommended = response.find((f) => f.section === 'Recommended')?.apps;
    setFeaturedApps(featured);
    setRecommendedApps(recommended);
  };

  useEffect(() => {
    fetchFeaturedApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Container>
        <StyledHeading typography="headline_l">{t('TITLE')}</StyledHeading>
        <ExternalLink href={XVERSE_EXPLORE_URL} target="_blank" rel="noreferrer">
          <ArrowsOut size={16} />
          {t('EXPAND_VIEW')}
        </ExternalLink>
        <Subheader>
          {t('FEATURED')}
          <SwiperNavigation />
        </Subheader>
        {!!featuredApps?.length && <FeaturedCardCarousel items={featuredApps} />}
        <Subheader>{t('RECOMMENDED')}</Subheader>
        {!!recommendedApps?.length && <RecommendedApps items={recommendedApps} />}
      </Container>
      <BottomBar tab="explore" />
    </>
  );
}

export default ExploreScreen;
