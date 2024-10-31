import FeaturedCardCarousel from '@components/explore/FeaturedCarousel';
import RecommendedApps from '@components/explore/RecommendedApps';
import SwiperNavigation from '@components/explore/SwiperNavigation';
import BottomBar from '@components/tabBar';
import useFeaturedDapps from '@hooks/useFeaturedDapps';
import { ArrowsOut } from '@phosphor-icons/react';
import { StyledHeading } from '@ui-library/common.styled';
import Spinner from '@ui-library/spinner';
import { Tabs } from '@ui-library/tabs';
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
  text-transform: uppercase;
`;

const ExternalLink = styled.a`
  ${({ theme }) => theme.typography.body_medium_m};
  display: flex;
  align-items: center;
  align-self: flex-start;
  column-gap: ${({ theme }) => theme.space.xs};
  color: ${({ theme }) => theme.colors.white_0};
  margin-top: ${({ theme }) => theme.space.s};
  cursor: pointer;
  transition: opacity 0.1s ease;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }
`;

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.space.l,
}));

function ExploreScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'EXPLORE_SCREEN' });
  const { featured, recommended, tabs, isLoading } = useFeaturedDapps();
  const [activeTab, setActiveTab] = useState<string | undefined>();

  useEffect(() => {
    if (tabs && tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0].value);
    }
  }, [tabs, activeTab]);

  const category = recommended?.filter((r) => r.category === activeTab);

  return (
    <>
      {isLoading ? (
        <LoaderContainer>
          <Spinner color="white" size={30} />
        </LoaderContainer>
      ) : (
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
          {!!featured?.length && <FeaturedCardCarousel items={featured} />}
          {tabs && <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />}
          {!!category?.length && <RecommendedApps items={category} />}
        </Container>
      )}
      <BottomBar tab="explore" />
    </>
  );
}

export default ExploreScreen;
