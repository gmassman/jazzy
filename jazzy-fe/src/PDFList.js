import React, { useState, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import Modal from 'react-modal'
import axios from 'axios'

import config from './config'
import PDFPreview from './PDFPreview'
import EnlargedPDF from './EnlargedPDF'

Modal.setAppElement('#root')

const MemoizedPDFPreview = React.memo(PDFPreview)

const Row = ({ data, index, style }) => {
    const {
        sheets,
        activePDF,
        enlargePDF,
        unenlargePDF
    } = data,
    sheet = sheets[index],
    flexStyle = {
        display: 'flex',
        justifyContent: 'center'
    }

    return (
        <div key={sheet.id} style={{ ...style, ...flexStyle }}>
            <canvas id={sheet.id} onClick={enlargePDF}></canvas>
            <MemoizedPDFPreview {...sheet}></MemoizedPDFPreview>
            <Modal
                isOpen={!!activePDF}
                onRequestClose={unenlargePDF}
            >
                <EnlargedPDF {...activePDF}></EnlargedPDF>
            </Modal>
        </div>
    )
}

const MemoizedRow = React.memo(Row)

function PDFList({serverURL}) {
    const [state, setState] = useState({
        page: 0,
        sheets: [],
        activePDF: null
    })

    const incPageNumber = () => {
        setState({
            ...state,
            page: state.page + 1
        })
    }

    const isSheetLoaded = index => !!state.sheets[index]

    const enlargePDF = (e) => {
        e.preventDefault()
        const item = state.sheets.find(el => el.id === e.target.id)
        setState({
            ...state,
            activePDF: item
        })
    }

    const unenlargePDF = () => {
        setState({
            ...state,
            activePDF: null
        })
    }


    const updateSheets = () => {
        const fetchData = async () => {
            const response = await axios.get(`${serverURL}/pdfs?page=${state.page}`)
            setState({
                ...state,
                ...{ enlargePDF, unenlargePDF },
                sheets: [...state.sheets, ...response.data],
            })
        }
        fetchData()
    }

    useEffect(updateSheets, [state.page])

    return (
        <InfiniteLoader
            isItemLoaded={isSheetLoaded}
            itemCount={state.sheets.length + 10}
            loadMoreItems={incPageNumber}
        >
            {({ onItemsRendered, ref }) => (
                <List
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                    height={window.innerHeight}
                    itemCount={state.sheets.length}
                    itemData={{ ...state }}
                    itemSize={Math.ceil(config.previewScale * 800)} // pdfjs scale 1 : 800px height
                    width={window.innerWidth}
                >
                    {MemoizedRow}
                </List>
            )}
        </InfiniteLoader>
    )
}

export default PDFList