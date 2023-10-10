import { Wrench } from '@phosphor-icons/react';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${(props) => props.theme.colors.white_200};
`;

const ErrorTextContainer = styled.div`
  margin-top: ${(props) => props.theme.space.m};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default function WrenchErrorMesa({ className }: { className?: string }) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  return (
    <ErrorContainer className={className}>
      <Wrench size={48} weight="thin" />
      <ErrorTextContainer>
        <StyledP typography="body_bold_m">{t('ERROR_RETRIEVING')}</StyledP>
        <StyledP typography="body_bold_m">{t('TRY_AGAIN')}</StyledP>
      </ErrorTextContainer>
    </ErrorContainer>
  );
}
