import React, { useEffect, useRef, useMemo } from 'react'
import pdfjs from 'pdfjs-dist/build/pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

function renderPDFPage(pageLoader, scale, canvas) {
    return pageLoader.then(pdfPage => {
        const viewport = pdfPage.getViewport({ scale })

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

const SheetCanvas = ({
    canvasRef,
    canvasID
}) => (
    <canvas
        ref={canvasRef}
        id={canvasID}
    />
)

function PagePreview({
    id,
    pageNum,
    pageLoaders,
    scale
}) {
    const canvasRef = useRef(null)
    const canvasID = `sheet-${id}-page-${pageNum}`

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        // if (!pageLoaders[pageNum]) {
        //     debugger
        // }
        renderPDFPage(pageLoaders[pageNum], scale, canvas)
            .then(() => {
                console.log(`rendered page into canvas#${canvas.id}`)
            })
            .catch(error => {
                console.log(error)
            })
    }, [canvasRef, pageLoaders, pageNum, scale])

    const MemoizedCanvas = useMemo(() => (
        <SheetCanvas
            canvasRef={canvasRef}
            canvasID={canvasID}
        />
    ), [canvasRef, canvasID])

    return MemoizedCanvas
}

export default PagePreview;