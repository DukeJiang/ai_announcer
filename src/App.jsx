import React, { useState } from 'react';
import DemoHero from './components/DemoHero';
import DIDHero from './components/DIDHero'
import Demo from './components/Demo';
import DID from './components/DID';

import "./App.css";

const App = () => {
  const [showDID, setShowDID] = useState(false);

  // Function to toggle between <Demo /> and <DID />
  const toggleComponent = () => {
      setShowDID((prevShowDID) => !prevShowDID);
    };

  return (
    <main>
      <div className="main">
        <div className="gradient" />
      </div>

      <div className="app">
        <button onClick={toggleComponent}
                style={{
                  backgroundColor: "#3490dc",
                  color: "#ffffff",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  outline: "none",
                  border: "none",
                }}
        >
                  Toggle Mode
        </button>
        {showDID ? <DIDHero /> : <DemoHero />}
        {showDID ? <DID /> : <Demo />}
      </div>
    </main>
  )
}

export default App