import React from 'react';
const pdfjs = require('pdfjs-dist/build/pdf');
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PDFRow({
    source,
    filename,
    contents,
    page
}) {
    const pdfData = atob(contents);
    const loadingTask = pdfjs.getDocument({data: pdfData});
    loadingTask.promise.then(function(pdf) {

        // Fetch the first pdfPage
        const pageNumber = 1;
        pdf.getPage(pageNumber).then(function(pdfPage) {          
          const scale = 0.5;
          const viewport = pdfPage.getViewport({scale: scale});

          // Prepare canvas using PDF pdfPage dimensions
          const canvas = document.getElementById('canvas-' + page);
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF pdfPage into canvas context
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          const renderTask = pdfPage.render(renderContext);
          renderTask.promise.then(function () {
            console.log('Page rendered');
          });
        });
      }, function (reason) {
        // PDF loading error
        console.error(reason);
      });
    return (
        <>
            <span>{source} - {filename}</span>
        </>
    )
}

export default PDFRow;