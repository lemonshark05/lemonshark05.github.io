import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ themes, selectTheme }) => {
  const navigate = useNavigate();

  const handleThemeClick = (samples) => {
    selectTheme(samples);
    navigate('/');
  };

  return (
    <div className="App-sidebar">
      <div className="Header">
        <h3 className="Header-title">Hula.Ai</h3>
      </div>
      <div className="Menu">
        {themes.map((theme, index) => (
          <li className="Menu-item" key={index}>
            <button className="Menu-title" onClick={() => selectTheme(theme.samples)}>
              {theme.name}
            </button>
          </li>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
