import React, { useState, useEffect, useRef } from 'react'
import { FixedSizeList as List } from 'react-window'
import pdfjs from 'pdfjs-dist/build/pdf'

import SongAttributes from './SongAttributes'
import config from './config'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

function renderPDFPage(pageLoader, canvas) {
    return pageLoader.then(pdfPage => {
        const viewport = pdfPage.getViewport({scale: config.fullScale})

        const context = canvas.getContext('2d')

        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        }
        const renderTask = pdfPage.render(renderContext)
        return renderTask.promise
    })
    .catch(error => {
        console.log(error)
    })
}

function EnlargedPDF(activePDF) {
    const [state, setState] = useState({
        pagesLoaded: false,
        pageLoaders: [],
        dimensions: null
    })

    useEffect(() => {
        if (state.pageLoaders.length > 0) {
            return
        }
        const pdfData = atob(activePDF.contents)
        pdfjs.getDocument({data: pdfData}).promise
            .then(pdf => {
                const pageLoaders = Array.from({length: pdf.numPages}, (_, i) => pdf.getPage(i+1))
                getDimensions(pageLoaders[0], pdf.numPages).then(dimensions => {
                    setState({
                        pagesLoaded: true,
                        pageLoaders: pageLoaders,
                        dimensions: dimensions
                    })
                })
            })
    })

    const Column = ({ index, style }) => {
        const canvasRef = useRef(null)

        useEffect(() => {
            const canvas = canvasRef.current

            if (!canvas) return

            renderPDFPage(state.pageLoaders[index], canvas)
                .then(() => {
                    console.log(`rendered page into canvas#${canvas.id}`)
                })
                .catch(error => {
                    console.log(error)
                })
        })

        style = { ...style, display: 'flex' }

        return (
            <div key={`pdf-page-${index}`} style={style}>
                <canvas
                    ref={canvasRef}
                    id={`page-${index}`}
                />
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

    return state.pagesLoaded ? (
        <>
            <SongAttributes activePDF={activePDF}></SongAttributes>
            <List
                layout='horizontal'
                itemCount={state.pageLoaders.length}
                itemSize={Math.ceil(state.dimensions.width / state.pageLoaders.length)}
                {...state.dimensions}
            >
                {Column}
            </List>
        </>
    ) : (
        <span>loading...</span>
    )
}

export default EnlargedPDF;