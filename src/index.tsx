import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // เติมนามสกุล .tsx ลงไปตรงๆ เพื่อบังคับให้ Vite หาเจอ
import './index.css'; // มั่นใจว่ามีไฟล์นี้อยู่ใน src ด้วย

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
