import React from 'react';
import { render } from 'react-dom';
import App from '../../app/App';

render(<App />, window.document.querySelector('#app-container'));

// eslint-disable-next-line no-undef
if (module.hot) module.hot.accept();
