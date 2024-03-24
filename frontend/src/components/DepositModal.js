import React, { createContext, useContext, useState } from 'react';
import './DepositModal.css'

export const DepositContext = createContext();

export const DepositProvider = ({ children }) => {
  const [isDepositOpen, setDepositOpen] = useState(false);

  return (
    <DepositContext.Provider value={{ isDepositOpen, setDepositOpen}}>
      {children}
    </DepositContext.Provider>
  );
};


export const DepositModal = () => {
  const { isDepositOpen, setDepositOpen } = useContext(DepositContext);
  return (
    <div className={isDepositOpen ? 'modal active' : 'modal'}>
      <div className='modal-content'>
      <button onClick={()=>{setDepositOpen(false)}}>Close</button>
      </div>
    </div>
  );
}
