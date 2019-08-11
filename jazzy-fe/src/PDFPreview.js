import React from 'react';
import pdfjs from 'pdfjs-dist/build/pdf';

import config from './config';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function renderPDF(contents, id) {
    const pdfData = atob(contents);
    return pdfjs.getDocument({data: pdfData}).promise
        .then(pdf => {
            const pageNumber = 1;
            return pdf.getPage(pageNumber);
        }).then(pdfPage => {
            const scale = config.previewScale;
            const viewport = pdfPage.getViewport({scale: scale});

            const canvas = document.getElementById(id);
            const context = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

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

function PDFPreview({
    source,
    filename,
    contents,
    id,
    page
}) {
    renderPDF(contents, id)
        .then(() => console.log(`rendered ${filename}`));
    return (
        <>
            <div>
                <span>source file: {source}</span>
                <br/>
                <span>filename: {filename}</span>
                <br/>
                <span>page number: {page}</span>
                <br/>
                <span>ObjectId: {id}</span>
            </div>
        </>
    )
}

export default PDFPreview;