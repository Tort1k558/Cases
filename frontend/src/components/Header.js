import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { AuthContext } from '../AuthContext';
import { DepositContext } from './DepositModal';

import logo from '../images/logo-color.png';
import loginIcon from '../images/login-icon.png';

import "./Header.css"

const Header = () => {
  const { user, login } = useContext(AuthContext);
  const { setDepositOpen } = useContext(DepositContext);

  const handleLogin = () => {
    login();
  };
  return (
    <header>
      <Link to="/" className="logo">
        <img src={logo} alt="Logo" />
      </Link>
      <nav className='header-container'>
        {user ? (
          <div className='header-user-container'>
            <button className="header-user-deposit" onClick={()=>{setDepositOpen(true)}}>Deposit</button>
            <Link to="/profile" className="header-user-info">
                <img src={user.avatar} alt="Avatar" className="avatar" />
                <div className="header-user-details">
                  <div className="header-user-username">{user.username}</div>
                  <div className="header-user-balance">{user.balance} RUB</div>
                </div>
            </Link>
          </div>
        ) : (
          <button className="header-login-container" onClick={handleLogin}> 
            <img src={loginIcon} alt="Login" className="header-login-icon"/>
            <span>Login</span>
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
