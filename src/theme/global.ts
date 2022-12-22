import { createGlobalStyle } from 'styled-components';
import SatoshiBold from '../assets/fonts/Satoshi-Bold.otf';
import SatoshiBlack from '../assets/fonts/Satoshi-Black.otf';
import SatoshiMedium from '../assets/fonts/Satoshi-Medium.otf';
import SatoshiRegular from '../assets/fonts/Satoshi-Regular.otf';

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
