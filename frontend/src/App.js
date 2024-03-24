import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Profile from './pages/Profile';
import Cases from './pages/Cases';
import Case from './pages/Case';
import Header from './components/Header';
import CaseHistory from './components/CaseHistory';
import { AuthProvider } from './AuthContext';
import { DepositModal, DepositProvider } from './components/DepositModal'; 
import './App.css';
import background from './images/background.jpg';

const App = () => {
  return (
    <AuthProvider>
      <DepositProvider>
        <BrowserRouter>
          <Header />
          <CaseHistory />
          <div className='main-content' style={{backgroundImage: `url(${background})`}}>
            <Routes>
              <Route path="/" element={<Cases />} />
              <Route path="/case/:caseId" element={<Case />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
          <DepositModal /> 
        </BrowserRouter>
      </DepositProvider>
    </AuthProvider>
  );
}

export default App;
