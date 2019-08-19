import React, { useState } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import Modal from 'react-modal'

import config from 'config'

import PagePreview from 'Components/PagePreview'
import EnlargedSheet from 'Components/EnlargedSheet'

import useSheets from 'Hooks/useSheets'

Modal.setAppElement('#root')

const SheetAttrs = ({
    source,
    filename,
    page,
    id
}) => (
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

const Row = ({
    data,
    index,
    style
}) => {
    const {
        sheets,
        activePDF,
        enlargePDF,
        shrinkPDF
    } = data,
    sheet = sheets[index],
    flexStyle = {
        display: 'flex',
        justifyContent: 'center'
    }
    // if (!!activePDF) {
    //     debugger
    // }
    return (
        <div key={sheet.id} style={{ ...style, ...flexStyle }} onClick={enlargePDF}>
            <PagePreview
                {...sheet}
                pageNum={1}
                scale={config.previewScale}
            />
            <SheetAttrs {...sheet} />
            <Modal
                isOpen={!!activePDF}
                onRequestClose={shrinkPDF}
            >
                <EnlargedSheet {...activePDF} />
            </Modal>
        </div>
    )
}

function PDFList() {
    const [activePDF, setActivePDF] = useState(null)
    const [batch, setBatch] = useState(0)
    const sheets = useSheets(batch)

    const incBatch = () => setBatch(batch + 1)

    const isSheetLoaded = index => !!sheets[index]

    const enlargePDF = (e) => {
        const sheet = sheets.find(el => e.target.id.match(el.id))
        setActivePDF(sheet)
    }

    const shrinkPDF = () => {
        setActivePDF(null)
    }

    return (
        <InfiniteLoader
            isItemLoaded={isSheetLoaded}
            itemCount={sheets.length + 10}
            loadMoreItems={incBatch}
        >
            {({ onItemsRendered, ref }) => (
                <List
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                    height={window.innerHeight}
                    itemCount={sheets.length}
                    itemData={{ sheets, activePDF, enlargePDF, shrinkPDF }}
                    itemSize={Math.ceil(config.previewScale * 800)} // pdfjs scale 1 : 800px height
                    width={window.innerWidth}
                >
                    {Row}
                </List>
            )}
        </InfiniteLoader>
    )
}

export default PDFList