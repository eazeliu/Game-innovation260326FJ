import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import TestPage from './pages/TestPage';
import GridAnchorPage from './pages/GridAnchorPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<TestPage />} />
        <Route path="/grid-anchor" element={<GridAnchorPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
