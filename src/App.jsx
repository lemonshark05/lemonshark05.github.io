import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CardList from './components/CardList';
import SamplePage from './components/SamplePage';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';

function App() {
  const [themes, setThemes] = useState([]);
  const [selectedSamples, setSelectedSamples] = useState([]);

  useEffect(() => {
    fetch('/src/assets/theme.json')
    .then((response) => response.json())
    .then((data) => setThemes(data.themes))
    .catch((error) => console.error('Error fetching themes:', error));
  }, []);

  useEffect(() => {
    if (themes.length > 0) {
      setSelectedSamples(themes[0].samples);
    }
  }, [themes]);

  const selectTheme = (samples) => {
    setSelectedSamples(samples);
  };

  const AppContent = () => {
    const navigate = useNavigate();

    return (
      <div className="App">
        <Sidebar 
          themes={themes} 
          selectTheme={(samples) => {
            selectTheme(samples);
            navigate('/');
          }} 
        />
        <div className="App-page">
          <Routes>
            <Route path="/" element={<CardList samples={selectedSamples} />} />
            <Route path="/sample/:sampleTitle" element={<SamplePage samples={selectedSamples} />} />
          </Routes>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;