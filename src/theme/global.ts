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

/* react-modal transition solution from the docs: https://reactcommunity.org/react-modal/styles/transitions/ */
.ReactModal__Overlay {
  opacity: 0;
  transition: opacity 200ms cubic-bezier(0, 0, 0.58, 1);
}

.ReactModal__Overlay--after-open {
  opacity: 1;
}

.ReactModal__Overlay--before-close {
  opacity: 0;
}

.ReactModal__Content {
  opacity: 0;
  transform: translateY(100%);
  transition: transform 200ms cubic-bezier(0, 0, 0.58, 1), 
              opacity 200ms cubic-bezier(0, 0, 0.58, 1);
}

.ReactModal__Content--after-open {
  transform: translateY(0);
  opacity: 1;
}

.ReactModal__Content--before-close {
  transform: translateY(100%);
  opacity: 0;
}
`;
export default GlobalStyle;
