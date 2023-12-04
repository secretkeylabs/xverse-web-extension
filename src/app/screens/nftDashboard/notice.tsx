import { ArrowRight, XCircle } from '@phosphor-icons/react';
import { StyledHeading } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  background: props.theme.colors.elevation6_600,
  padding: 16,
  marginTop: props.theme.space.xs,
  width: '100%',
}));

const Heading = styled(StyledHeading)`
  flex: 1;
`;

const Description = styled(StyledHeading)`
  padding-right: ${(props) => props.theme.spacing(12)}px;
`;

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const ButtonImage = styled.button({
  backgroundColor: 'transparent',
  display: 'flex',
});

const BundleLinkContainer = styled.button((props) => ({
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'transparent',
  color: props.theme.colors.white_0,
  marginTop: props.theme.space.xs,
  transition: 'background-color 0.2s ease, opacity 0.2s ease',
  ':hover': {
    color: props.theme.colors.white_200,
  },
}));
const BundleLinkText = styled.div((props) => ({
  ...props.theme.body_medium_m,
  marginRight: props.theme.spacing(1),
}));

interface Props {
  title: string;
  description: string;
  onClose?: () => void;
  seeRarities?: () => void;
}

function Notice({ title, description, onClose, seeRarities }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  return (
    <Container>
      <RowContainer>
        <Heading typography="body_bold_m" color="white_0">
          {title}
        </Heading>
        {onClose && (
          <ButtonImage onClick={onClose}>
            <XCircle color={Theme.colors.white_200} weight="fill" size="24" />
          </ButtonImage>
        )}
      </RowContainer>
      <Description typography="body_m" color="white_200">
        {description}
      </Description>

      <BundleLinkContainer onClick={seeRarities}>
        <BundleLinkText>{t('SEE_SUPPORTED')}</BundleLinkText>
        <ArrowRight size={16} weight="bold" />
      </BundleLinkContainer>
    </Container>
  );
}
export default Notice;
