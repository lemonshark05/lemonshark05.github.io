import React from 'react';

const Card = ({title, content}) => {
  return (
    <div className="Card">
      <h2 className="number">{title}</h2>
      {/* <h2>{content}</h2> */}
    </div>
  );
};

export default Card;
