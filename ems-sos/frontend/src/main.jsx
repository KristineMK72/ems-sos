import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Removed the index.css import to prevent conflicts

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);