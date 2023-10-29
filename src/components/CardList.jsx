import React from 'react';
import Card from './Card';
import { Link } from 'react-router-dom';

function CardList({ samples }) {
    return (
        <div className="App-row">
          {samples.map((sample, index) => (
            <Link key={index} to={`/sample/${encodeURIComponent(sample.title.toLowerCase())}`}>
              <Card title={sample.title} content={sample.content} />
            </Link>
          ))}
        </div>
    );
}
export default CardList;