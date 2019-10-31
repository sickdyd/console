import React from 'react';

import { isMobile } from 'react-device-detect';

import Walloflinks from './components/Walloflinks.js';
import Console from './components/Console.js';

import './App.css';

function App() {

  React.useEffect(()=>{
    isMobile && (document.body.style.position = 'relative')
  })

  return (
    <div className="App">
      <header id={isMobile ? 'App-header' : ''} className='App-header'>
        <Console/>

        <div className='fader-container' style={isMobile ? {position: 'fixed', top: '0', left: '0'} : {}}>
          <Walloflinks />
        </div>

      </header>
    </div>
  );
}

export default App; 