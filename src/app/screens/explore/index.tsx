import magicEdenLogo from '@assets/img/explore/magicEden.jpg';
import ordMarketLogo from '@assets/img/explore/ordinalsMarketLogo.jpg';
import FeaturedCardCarousel from '@components/explore/FeaturedCarousel';
import RecommendedApps from '@components/explore/RecommendedApps';
import SwiperNavigation from '@components/explore/SwiperNavigation';
import BottomBar from '@components/tabBar';
import useWalletSelector from '@hooks/useWalletSelector';
import { getFeaturedDapps } from '@secretkeylabs/xverse-core';
import { StyledHeading } from '@ui-library/common.styled';
import { useEffect } from 'react';
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
  margin-top: 32px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.white_200};
`;

const featuredApps = [
  {
    link: 'https://magiceden.io/',
    src: magicEdenLogo,
    text: 'Discover and trade NFTs, Ordinals & more',
  },
  {
    link: 'https://magiceden.io/',
    src: magicEdenLogo,
    text: 'Start creating your digital legacy on Bitcoin',
  },
  {
    link: 'https://magiceden.io/',
    src: magicEdenLogo,
    text: 'The launchpad for the biggest and best.',
  },
  {
    link: 'https://magiceden.io/',
    src: magicEdenLogo,
    text: 'Start creating your digital legacy on Bitcoin',
  },
  {
    link: 'https://magiceden.io/',
    src: magicEdenLogo,
    text: 'Discover and trade NFTs, Ordinals & more',
  },
];

const recommendedApps = [
  {
    link: 'https://ordinals.market/',
    src: ordMarketLogo,
    title: 'Ninjalerts',
    text: 'Get Ordinals Allowlist Now',
  },
  {
    link: 'https://ordinals.market/',
    src: ordMarketLogo,
    title: 'Block Survey',
    text: 'Private, Secure, and Anonymous Surveys',
  },
  {
    link: 'https://ordinals.market/',
    src: ordMarketLogo,
    title: 'Ordinals.Market',
    text: 'Discover thousands of Ordinals collections',
  },
  {
    link: 'https://ordinals.market/',
    src: ordMarketLogo,
    title: 'Gamma.io',
    text: 'Start creating your digital legacy on Bitcoin',
  },
  {
    link: 'https://ordinals.market/',
    src: ordMarketLogo,
    title: 'Console.xyz',
    text: 'Discover and trade NFTs, Ordinals & more',
  },
  {
    link: 'https://ordinals.market/',
    src: ordMarketLogo,
    title: 'Ord.io',
    text: 'Discover and trade NFTs, Ordinals & more',
  },
];

function ExploreScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'EXPLORE_SCREEN' });
  const { network } = useWalletSelector();

  const fetchFeaturedApps = async () => {
    const data = await getFeaturedDapps(network.type, true);
    console.log('Featured Apps:', data);
    // TODO: Use this data instead of the mocked data
  };

  useEffect(() => {
    fetchFeaturedApps();
  }, []);

  return (
    <>
      <Container>
        <StyledHeading typography="headline_l">{t('TITLE')}</StyledHeading>

        <Subheader>
          Featured
          <SwiperNavigation />
        </Subheader>
        <FeaturedCardCarousel items={featuredApps} />
        <Subheader>Recommended</Subheader>
        <RecommendedApps items={recommendedApps} />
      </Container>
      <BottomBar tab="explore" />
    </>
  );
}

export default ExploreScreen;
