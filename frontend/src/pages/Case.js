import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Roulette from '../components/Roulette';
import './Case.css';
import api, { baseURL } from '../Api';

const Case = () => {
  const { caseId } = useParams();
  const [items, setItems] = useState([]);
  const [caseInfo, setCase] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get(`/case/${caseId}/`);
        setCase(response.data)
        const sortedItems = response.data.items.sort((a, b) => {
          return b.rarity - a.rarity;
        });
        setItems(sortedItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, [caseId]);

  return (
    <div className="case-container">
      <h2 className="heading">{caseInfo?.name}</h2>
      <h2>{caseInfo?.price} RUB</h2>
      <Roulette case={caseInfo}/>
      <h2 className="items-title">Содержимое кейса</h2>
      <div className='case-items'>
        {items.map((item, index) => (
          <div key={index} className={`case-item rarity-${item.rarity}`}>
            <h3 className='item-info-price'>{item.price} RUB</h3>
            <img src={baseURL + item.image} alt={item.name} />
            <div className="item-info">
              <h3 className='item-info-name'>{item.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Case;
