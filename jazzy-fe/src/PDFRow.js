import React from 'react';
// import { Document, Page } from 'react-pdf';
import { Document, Page } from 'react-pdf/dist/entry.webpack';

function PDFRow({
    source,
    filename,
    contents
}) {
    // console.log('pdf contents:' + contents)
    return (
        <>
            <Document
                file={contents}
            >
                <Page pageNumber={1} />
            </Document>
            <span>{source} - {filename}</span>
        </>
    )
}

export default PDFRow;