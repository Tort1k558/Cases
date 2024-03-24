import React, { useContext, useEffect, useRef, useState } from 'react';
import './Roulette.css';
import { AuthContext } from '../AuthContext';
import { baseURL } from '../Api';

const Roulette = ({ case: caseInfo }) => {
  const [result, setResult] = useState(null);
  const [shuffledItems, setShuffledItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [spinning, setSpinning] = useState(false);
  
  const rouletteItemsRef = useRef(null);
  const rouletteRef = useRef(null);

  const { openCase } = useContext(AuthContext);
  const countItems = 64;
  const resultItem = 55;
  const rarityProbabilities = {
    1: 0.3,
    2: 0.55, 
    3: 0.75, 
    4: 0.85, 
    5: 0.98, 
    6: 0.99,
    7: 1.00,
  };
  
  useEffect(() => {
    const fetchItems = () => {
      try {
        if (caseInfo && caseInfo.items.length > 0) {
          let newArray = [];
          for (let i = 0; i < countItems; i++) {
            const getItem = () =>{
              const random = Math.random();
              for (let rarity in rarityProbabilities) {
                if (random <= rarityProbabilities[rarity]) {
                  const filteredItems = caseInfo.items.filter(item => item.rarity == rarity);
                  if (filteredItems.length == 0)
                    continue;
                  const randomIndex = parseInt(Math.random() * (filteredItems.length));
                  return filteredItems[randomIndex];
                }
              }
              return getItem();
            }
            newArray.push(getItem());
          }
          setShuffledItems(newArray);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, [caseInfo]);


  const handleSpin = async () => {
    try {
      setSpinning(true)
      if (rouletteItemsRef.current) {
        rouletteItemsRef.current.classList.add('no-transition');
        rouletteItemsRef.current.style.transform = 'none';
      }
      const result = await openCase(caseInfo.id);
      shuffledItems[resultItem] = result;
      setShuffledItems(shuffledItems);
      if (rouletteItemsRef.current) {
        rouletteItemsRef.current.classList.remove('no-transition');
      }
      scrollToItem(resultItem);
      
    } catch (error) {
      setError(String(error))
    }
  };

  const scrollToItem = (index) => {
    const item = rouletteItemsRef.current.children[index];
    const itemOffset = item.offsetLeft;
    const rouletteWidth = rouletteRef.current.offsetWidth;
    const getRandomNumber = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const offset = getRandomNumber(itemOffset, itemOffset + item.offsetWidth);
    rouletteItemsRef.current.style.transform = `translate3d(${-offset + rouletteWidth / 2}px,0,0)`;

  };

  return (
    <div className="roulette-container">
      {!spinning && caseInfo ? (
        <img className='case-avatar' src={baseURL + caseInfo.image} alt="Case Image" />
        ) : (
        <div ref={rouletteRef} className="roulette-wheel">
        <div ref={rouletteItemsRef} className='roulette-items'>
          {isLoaded && shuffledItems.map((item, index) => (
            item &&
            <div key={index} className={`roulette-item rarity-${item.rarity}`}>
              <img src={baseURL + item.image} alt=""></img>
            </div>
          ))}
        </div>
        <div className="roulette-middle-line"></div>
        </div>
        )
      }
      
      <button className='roulette-spin' onClick={handleSpin} disabled={result !== null}>Spin</button>
      {result && <div className="result">{result.name}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Roulette;
