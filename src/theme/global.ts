import { createGlobalStyle } from 'styled-components';
import SatoshiBold from '../assets/fonts/Satoshi-Bold.otf';
import SatoshiBlack from '../assets/fonts/Satoshi-Black.otf';
import SatoshiMedium from '../assets/fonts/Satoshi-Medium.otf';
import SatoshiRegular from '../assets/fonts/Satoshi-Regular.otf';
import IBMPlexSansRegular from '../assets/fonts/IBMPlexSans-Regular.ttf';
import IBMPlexSansBold from '../assets/fonts/IBMPlexSans-Bold.ttf';
import IBMPlexSansMedium from '../assets/fonts/IBMPlexSans-Medium.ttf';
import DMSansBold from '../assets/fonts/DMSans-Bold.ttf';
import DMSansMedium from '../assets/fonts/DMSans-Medium.ttf';
import DMSansRegular from '../assets/fonts/DMSans-Regular.ttf';

const GlobalStyle = createGlobalStyle`
  @font-face{
    font-family: 'Satoshi-Bold';
    src: url(${SatoshiBold});
    font-display: block;

  }
    @font-face{
    font-family: 'Satoshi-Medium';
    src: url(${SatoshiMedium});
    font-display: block;

  }
    @font-face{
    font-family: 'Satoshi-Regular';
    src: url(${SatoshiRegular});
    font-display: block;

  }
    @font-face{
    font-family: 'Satoshi-Black';
    src: url(${SatoshiBlack});
    font-display: block;
  }
  @font-face{
    font-family: 'IBMPlexSans-Regular';
    src: url(${IBMPlexSansRegular});
    font-display: block;
  }
  @font-face{
    font-family: 'IBMPlexSans-Bold';
    src: url(${IBMPlexSansBold});
    font-display: block;
  }
  @font-face{
    font-family: 'IBMPlexSans-Medium';
    src: url(${IBMPlexSansMedium});
    font-display: block;
  }
  @font-face{
    font-family: 'DMSans-Bold';
    src: url(${DMSansBold});
    font-display: block;
  }
  @font-face{
    font-family: 'DMSans-Medium';
    src: url(${DMSansMedium});
    font-display: block;
  }
  @font-face{
    font-family: 'DMSans-Regular';
    src: url(${DMSansRegular});
    font-display: block;
  }
  html {
    box-sizing: border-box;
  }
  * {
  margin: 0;
  padding: 0;
  }
  * input, * button {
    outline: 0;
  }
  * button {
    cursor: pointer;
    border: 0;
  }
  * p {
    margin: 0;
  }
  * a {
    text-decoration: none;
  }
  * a:hover {
    text-decoration:none; 
    cursor:pointer;  
}
*,
*::after,
*::before {
  box-sizing: inherit;
  cursor: inherit;
  line-height: normal;
  -webkit-font-smoothing: antialiased;
}
`;
export default GlobalStyle;
