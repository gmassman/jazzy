import React, { useState, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import pdfjs from 'pdfjs-dist/build/pdf'

import config from 'config'

import PagePreview from 'Components/PagePreview'
import SongAttributes from 'Components/SongAttributes'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

function EnlargedSheet(activePDF) {
    const [dimensions, setDimensions] = useState(null)
    const [pagesLoaded, setPagesLoaded] = useState(false)
    const {
        id,
        pageLoaders
    } = activePDF,
    numPages = Object.keys(pageLoaders || {}).length

    useEffect(() => {
        if (!pageLoaders) return

        const getDimensions = async (pageLoader) => {
            const pdfPage = await Promise.resolve(pageLoader)
            const viewport = pdfPage.getViewport({ scale: config.fullScale })
            setDimensions({
                height: Math.ceil(viewport.height),
                width: Math.ceil(viewport.width * numPages)
            })
            setPagesLoaded(true)
        }

        getDimensions(pageLoaders[1])
    }, [pageLoaders, numPages])

    const Column = ({ index, style }) => {
        return (
            <div key={`pdf-page-${index}`} style={{ ...style, display: 'flex' }}>
                <PagePreview
                    id={`modal-${id}`}
                    pageLoaders={pageLoaders}
                    pageNum={index + 1}
                    scale={config.fullScale}
                />
            </div>
        )
    }

    return pagesLoaded ? (
        <>
            <SongAttributes {...activePDF}></SongAttributes>
            <List
                layout='horizontal'
                itemCount={numPages}
                itemSize={Math.ceil(dimensions.width / numPages)}
                {...dimensions}
            >
                {Column}
            </List>
        </>
    ) : (
        <span>Loading...</span>
    )
}

export default EnlargedSheet;