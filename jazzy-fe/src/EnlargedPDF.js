import React, { useState, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import pdfjs from 'pdfjs-dist/build/pdf'

import config from './config'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

function renderPDFPage(page) {
    return page.then(pdfPage => {
            const viewport = pdfPage.getViewport({scale: config.fullScale})
    
            const id = `page-${pdfPage.pageIndex}`
            const canvas = document.getElementById(id)
            const context = canvas.getContext('2d')
    
            canvas.height = viewport.height
            canvas.width = viewport.width

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            return pdfPage.render(renderContext).promise
        })
        .catch(error => {
            console.log(error)
        })
}

function PDFPage({page}) {
    renderPDFPage(page)
        .then(() => {
            console.log(`rendered page ${page}`)
        })
        .catch(error => {
            console.log(error)
        })
    return (
        <>
        </>
    )
}

const MemoizedPDFPage = React.memo(PDFPage)

function EnlargedPDF(item) {
    const [pagesLoaded, setPagesLoaded] = useState(false)
    const [PDFPages, setPDFPages] = useState([])
    const [dimensions, setDimensions] = useState(null)

    useEffect(() => {
        if (PDFPages.length > 0) {
            return
        }
        const pdfData = atob(item.contents)
        pdfjs.getDocument({data: pdfData}).promise
            .then(pdf => {
                const pageLoaders = Array.from({length: pdf.numPages}, (_, i) => pdf.getPage(i+1))
                setPDFPages(pageLoaders)
                getDimensions(pageLoaders[0], pdf.numPages).then(results => {
                    setDimensions(results)
                    setPagesLoaded(true)
                })
            })
    })

    const Column = ({ index, style }) => {
        const pdfPage = PDFPages[index]
        style = { ...style, display: 'flex' }
        return (
            <div key={`pdf-page-${index}`} style={style}>
                <canvas id={`page-${index}`}></canvas>
                <MemoizedPDFPage page={pdfPage}></MemoizedPDFPage>
            </div>
        )
    }

    const getDimensions = (pageLoader, numPages) => {
        return new Promise(resolve => {
            pageLoader.then(pdfPage => {
                const viewport = pdfPage.getViewport({scale: config.fullScale})
                resolve({
                    height: Math.ceil(viewport.height),
                    width: Math.ceil(viewport.width * numPages)
                })
            })
        })
    }

    return pagesLoaded ? (
        <List
            layout='horizontal'
            itemCount={PDFPages.length}
            itemSize={Math.ceil(dimensions.width / PDFPages.length)}
            {...dimensions}
        >
            {Column}
        </List>
    ) : (
        <span>loading...</span>
    )
}

export default EnlargedPDF;