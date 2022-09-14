import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const StyledHeader = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: ${(props) => props.theme.colors.action.classic};
`;

const Header = () => {
  const { t } = useTranslation('translation', {keyPrefix: 'common'});
  return <StyledHeader>{t('appName')}</StyledHeader>;
};

export default Header;
