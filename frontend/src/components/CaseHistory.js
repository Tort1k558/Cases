import React, { useState, useEffect, useRef } from 'react';
import api, { baseURL } from '../Api';

import './CaseHistory.css';

const CaseHistory = () => {
  const [caseHistory, setCaseHistory] = useState([]);

  useEffect(() => {
    const socket = new WebSocket(`ws://${baseURL.replace(/^https?:\/\//,'')}/ws/`);
    const fetchCaseHistory = async () => {
        try {
          const response = await api.get('/case-history/');
          setCaseHistory(response.data); 
        } catch (error) {
          console.error('Failed to fetch case history:', error);
        }
      };
  
    fetchCaseHistory();
    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCaseHistory(data);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      socket.close();
    };
  }, []);

  const itemCardsRef = useRef();
  useEffect(() => {
    const element = itemCardsRef.current?.firstChild;

    if (element) {
      element.classList.add('anim');

      const handleAnimationEnd = () => {
        element.classList.remove('anim');
      };
  
      element.addEventListener('animationend', handleAnimationEnd);
  
      return () => {
        element.removeEventListener('animationend', handleAnimationEnd);
      };
    }
  }, [caseHistory]);

  return (
    <div className="case-history">
      <div className='item-cards' ref={itemCardsRef}>
      {caseHistory.map((opening, index) => (
        <div className={`item-card rarity-${opening.item.rarity}`} key={index}>
          <img src={baseURL + opening.item.image} alt={opening.item.name} />
          <div className='item-name'>{opening.item.name}</div>
        </div>
      ))}
    </div>
    </div>
  );
}

export default CaseHistory;
