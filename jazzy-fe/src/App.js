import React from 'react';
import './App.css';
import PDFList from './PDFList';

function App() {
  return (
    <div className="App">
      <PDFList
        serverURL={process.env.REACT_APP_SERVER_URL}
      />
    </div>
  );
}

export default App;
