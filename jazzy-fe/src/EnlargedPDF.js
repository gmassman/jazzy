import React, { useState, useEffect, useRef } from 'react'
import { FixedSizeList as List } from 'react-window'
import pdfjs from 'pdfjs-dist/build/pdf'

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

const Input = ({ value, onChangeInput, children }) => (
    <label>
        {children}
        <input type="text" value={value} onChange={onChangeInput} />
    </label>
)

function EnlargedPDF(activePDF) {
    const [state, setState] = useState({
        pagesLoaded: false,
        pageLoaders: [],
        dimensions: null
    })
    const [currentPDF, setCurrentPDF] = useState(activePDF)

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

    const handleSongChange = event => {
        event.preventDefault()
        setCurrentPDF({
            ...currentPDF,
            song: event.target.value
        })
    }

    const handleComposerChange = event => {
        event.preventDefault()
        setCurrentPDF({
            ...currentPDF,
            composer: event.target.value
        })
    }

    const handleSubmit = event => {
        event.preventDefault()
        // do axios post to update the record
    }

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
            <Input value={currentPDF.song} onChangeInput={handleSongChange}>
                Song:
            </Input>
            <Input value={currentPDF.composer} onChangeInput={handleComposerChange}>
                Composer:
            </Input>
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