import React from 'react';
import './App.css';
import PDFList from './PDFList';

// import { pdfjs } from 'react-pdf';
// console.log(pdfjs);
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

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
