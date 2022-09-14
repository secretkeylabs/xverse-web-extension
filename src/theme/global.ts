import { createGlobalStyle } from 'styled-components';
import SatoshiBold from '../assets/fonts/Satoshi-Bold.otf';
import SatoshiBlack from '../assets/fonts/Satoshi-Black.otf';
import SatoshiMedium from '../assets/fonts/Satoshi-Medium.otf';
import SatoshiRegular from '../assets/fonts/Satoshi-Regular.otf';

export const GlobalStyle = createGlobalStyle`
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
  html {
    box-sizing: border-box
  }
* {
  margin: 0
  padding: 0
  }
*,
*::after,
*::before {
  box-sizing: inherit
  cursor: inherit
  line-height: normal
}
body {
  width: 360px;
  height: 600px;
  margin: 0;
  padding: 0;
  color: #FFFFFF;
  background-color: #12151E;
  position: relative;
}
`;
