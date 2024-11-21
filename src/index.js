import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './Login';

const RootComponent = () => {
  const [page, setPage] = useState('main'); // 초기 상태는 'main'

  switch (page) {
    case 'main':
      return <App setPage={setPage} />;
    case 'login':
      return <Login setPage={setPage} />;
    default:
      return null;
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RootComponent />);
