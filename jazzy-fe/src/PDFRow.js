import React from 'react';
const pdfjs = require('pdfjs-dist/build/pdf');
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function renderPDF(contents, page) {
    const pdfData = atob(contents);
    return pdfjs.getDocument({data: pdfData}).promise
        .then(pdf => {
            const pageNumber = 1;
            return pdf.getPage(pageNumber);
        }).then(pdfPage => {
            const scale = 0.75;
            const viewport = pdfPage.getViewport({scale: scale});

            // Prepare canvas using PDF pdfPage dimensions
            const canvas = document.getElementById(`canvas-${page}`);
            const context = canvas.getContext('2d');

            if (canvas.rendered) {
                return null;
            }
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.rendered = true;

            // Render PDF pdfPage into canvas context
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            return pdfPage.render(renderContext).promise;
        })
        .catch(error => {
            console.log(error);
        });
}

function PDFRow({
    source,
    filename,
    contents,
    page
}) {
    renderPDF(contents, page)
        .then(() => console.log(`rendered page ${page}`));
    return (
        <>
            <span>{source} - {filename}</span>
        </>
    )
}

export default PDFRow;