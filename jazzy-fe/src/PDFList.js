import React, { useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import Modal from 'react-modal';
import axios from 'axios';

import config from './config';
import PDFPreview from './PDFPreview';
import EnlargedPDF from './EnlargedPDF';

Modal.setAppElement('#root');

const MemoizedPDFPreview = React.memo(PDFPreview);

const Row = ({ data, index, style }) => {
    const { state, enlargePDF, unenlargePDF } = data;
    const item = state.items[index];
    style = { ...style, display: 'flex', justifyContent: 'center' };
    return (
        <div key={item.id} style={style}>
            <canvas id={item.id} onClick={enlargePDF}></canvas>
            <MemoizedPDFPreview {...item}></MemoizedPDFPreview>
            <Modal
                isOpen={!!state.activePDF}
                onRequestClose={unenlargePDF}
            >
                <EnlargedPDF {...state.activePDF}></EnlargedPDF>
            </Modal>
        </div>
    )
};

const MemoizedRow = React.memo(Row);

function PDFList({serverURL}) {
    const [state, setState] = useState({
        page: 0,
        items: [],
        activePDF: null
    });

    const updateItems = () => {
        const fetchData = async () => {
            const response = await axios.get(`${serverURL}/pdfs?page=${state.page}`);
            setState({
                ...state,
                items: [...state.items, ...response.data]
            });
        }
        fetchData();
    }

    const incPageNumber = () => {
        setState({
            ...state,
            page: state.page + 1
        });
    }

    const isItemLoaded = index => !!state.items[index];

    const enlargePDF = (e) => {
        e.preventDefault();
        const item = state.items.find(el => el.id === e.target.id);
        setState({
            ...state,
            activePDF: item
        });
    }

    const unenlargePDF = () => {
        setState({
            ...state,
            activePDF: null
        })
    }

    useEffect(updateItems, [state.page]);

    return (
        <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={state.items.length + 10}
            loadMoreItems={incPageNumber}
        >
            {({ onItemsRendered, ref }) => (
                <List
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                    height={window.innerHeight}
                    itemCount={state.items.length}
                    itemData={{ state, enlargePDF, unenlargePDF }}
                    itemSize={Math.ceil(config.previewScale * 800)} // pdfjs scale 1 : 800px height
                    width={window.innerWidth}
                >
                    {MemoizedRow}
                </List>
            )}
        </InfiniteLoader>
    );
}

export default PDFList;