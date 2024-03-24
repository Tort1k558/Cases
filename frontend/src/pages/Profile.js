import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import './Profile.css';
import { baseURL } from '../Api';

const HistoryCard = ({ historyItem }) => {
  const { withdrawItem } = useContext(AuthContext);
  const handleWithdrawItem = (history_id) =>
  {
    withdrawItem(history_id)
  }
  return (
    <div className={`history-card rarity-${historyItem.item.rarity}`}>
      <img src={baseURL + historyItem.item.image} alt={historyItem.item.name} />
      <div className="history-details">
        <p>{historyItem.item.name}</p>
        <p>{historyItem.item.price} RUB</p>
      </div>
      {!historyItem.withdrawn && (
        <button onClick={() => handleWithdrawItem(historyItem.id)}>Вывести</button>
      )}
    </div>
  );
}

const Profile = () => {
  const { user, loading, setTradeLink, logout} = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [tradeLink, setFormTradeLink] = useState('');
  

  const itemsPerPage = 25;
  const totalPages = user && user.case_history ? Math.ceil(user.case_history.length / itemsPerPage) : 1;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = user && user.case_history ? user.case_history.slice(indexOfFirstItem, indexOfLastItem) : [];

  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleSubmitTradeLink = () =>
  {
    setTradeLink(tradeLink);
  }
  
  useEffect(() => {
    if (user) {
      setFormTradeLink(user.trade_link);
    }
  }, [user]);
  
  return (
    <div className="profile-container">
      {loading ? (
        <p className="loading-message">Loading...</p>
      ) : user ? (
        <div className="profile-info">
          <div className="user-details">
            <h2 className='user-hello'>Welcome, {user.username}</h2>
            <button className='user-logout' onClick={logout}>Logout</button>

            <div className='user-details-content'>
              <div className='user-details-wrapper'>
                <h3>Trade Link</h3>
                <form className="trade-link-form" onSubmit={handleSubmitTradeLink}>
                  <input
                    type="text"
                    value={tradeLink}
                    onChange={(e) => setFormTradeLink(e.target.value)}
                    placeholder="Enter your trade link"
                    required
                  />
                  <button type="submit">Update Trade Link</button>
                </form>
              </div>
              <div className='user-details-wrapper'>
                {user.avatar && (<img src={user.avatar} alt="Avatar" className='user-avatar' />)}
              </div>
              <div className='user-details-wrapper'>
                <p>{user.balance} RUB</p>
              </div>
            </div>
          </div>
          
          <div className="profile-case-history">
            <h3>Case History</h3>
            {currentItems.length > 0 ? (
              <div>
                <div className="history-cards">
                  {currentItems.map((historyItem, index) => (
                    <HistoryCard key={index} historyItem={historyItem} />
                  ))}
                </div>
                <div className="pagination">
                  <button onClick={handlePrevPage} disabled={currentPage === 1}>Prev</button>
                  <span>{currentPage} / {totalPages}</span>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                </div>
              </div>
            ) : (
              <p>No case history available.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Please log in to your account</p>
      )}
    </div>
  );
}


export default Profile;
