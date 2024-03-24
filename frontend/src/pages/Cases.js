import React, { useState, useEffect } from 'react';
import { api, baseURL } from '../Api';
import { Link } from 'react-router-dom';
import './Cases.css'; // Подключаем файл стилей

const Cases =() => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    api.get('/sections/')
      .then(response => {
        setSections(response.data.sections);
      })
      .catch(error => {
        console.error('Error fetching sections:', error);
      });
  }, []);

  return (
    <div className="cases-container">
      {sections.map((section, index) => (
        <div className="section" key={index}>
          <h2 className="section-title">{section.name}</h2>
          <div className="case-list">
            {section.cases.map((caseItem, index) => (
              <Link to={`/case/${caseItem.id}`} key={index} className="case-link">
                <div className="case">
                  <img src={baseURL + caseItem.image} alt="" />
                  <div className='case-price'>{caseItem.price} RUB</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Cases;
