import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const StyledHeader = styled.h1`
  font-size: 1.5em;
  text-align: center;
  font-family: Satoshi-Regular;
  color: ${(props) => props.theme.colors.action.classic};
`;

function Header():JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'common' });
  return <StyledHeader>{t('appName')}</StyledHeader>;
}

export default Header;
