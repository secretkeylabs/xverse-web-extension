import { createGlobalStyle } from 'styled-components';
import './font.css';

const GlobalStyle = createGlobalStyle`
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
