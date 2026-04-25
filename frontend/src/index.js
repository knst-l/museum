import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './app/App';
import RouterProvider from './app/providers/RouterProvider';

import './app/styles/variables.css';
import './app/styles/index.css';
import './app/styles/app.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </React.StrictMode>
);


