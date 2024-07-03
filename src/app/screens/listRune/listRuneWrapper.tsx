import TopRow from '@components/topRow';
import { StyledP } from '@ui-library/common.styled';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  PaddingContainer,
  TabButton,
  TabButtonsContainer,
  TabContainer,
} from './index.styled';

type Props = {
  children: React.ReactNode;
  handleGoBack: () => void;
  selectedRuneId: string;
  getDesc: () => string;
};

function ListRuneWrapper({ children, handleGoBack, selectedRuneId, getDesc }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'LIST_RUNE_SCREEN' });
  const navigate = useNavigate();

  return (
    <>
      <TopRow onClick={handleGoBack} />
      <Container>
        <PaddingContainer>
          <Header>{t('LIST_RUNES')}</Header>
          <StyledP color="white_200" typography="body_m">
            {getDesc()}
          </StyledP>
          <TabContainer>
            <TabButtonsContainer>
              <TabButton isSelected onClick={() => navigate(`/list-rune/${selectedRuneId}`)}>
                {t('NOT_LISTED')}
              </TabButton>
              <TabButton
                isSelected={false}
                onClick={() => navigate(`/unlist-rune/${selectedRuneId}`)}
              >
                {t('LISTED')}
              </TabButton>
            </TabButtonsContainer>
          </TabContainer>
          {children}
        </PaddingContainer>
      </Container>
    </>
  );
}

export default ListRuneWrapper;
