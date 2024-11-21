import { useState, useEffect } from 'react'

import './Popup.css'

export const Popup = () => {
  const [darkMode, setDarkMode] = useState(false);
//   const TODO: need to implement logic -> dictionary to disable for specific websites

  const toggleDarkMode = () => {
    console.log('toggleDarkMode popup clicked');
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    chrome.storage.sync.set({ darkMode: newDarkMode });
    // chrome.runtime.sendMessage({ type: 'DARK_MODE_TOGGLE', darkMode: newDarkMode });//TODO: add better name for DARK_MODE_TOGGLE
  };

  useEffect(() => {
    chrome.storage.sync.get(['darkMode'], (result) => {//TODO: add better name for darkMode
      setDarkMode(result.darkMode || false);
    });
  }, []);

  return (
    <main className={darkMode ? 'dark' : ''}>
      <h3>Popup Page</h3>
      <label>
        <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
        Enabled for this Website
      </label>
      <br/>
      <label>
        <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
        Dark Mode
      </label>
    </main>
  );
};

export default Popup;
