import React from 'react';
import logo from '../../assets/img/xverseIcon.png';
import './Popup.css';

const Popup = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hello Xverse
        </a>
      </header>
    </div>
  );
};

export default Popup;
