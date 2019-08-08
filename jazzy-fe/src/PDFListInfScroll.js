import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';

import PDFRow from './PDFRow';

const MemoPDFRow = React.memo(PDFRow); // consider renaming to PDFPreview 

function PDFList({serverURL}) {
    const [page, setPage] = useState(0);
    const [items, setItems] = useState([]);

    const updateItems = () => {
        const fetchData = async () => {
            const response = await axios.get(`${serverURL}/pdfs?page=${page}`);
            setItems([...items, ...response.data]);
            console.log(items);
        }
        fetchData();
    }

    useEffect(updateItems, [page]);

    return (
        <InfiniteScroll
            dataLength={items.length}
            next={() => { setPage(page + 1) }}
            hasMore={true}
            loader={<h4>Loading...</h4>}
            endMessage={
                <p style={{textAlign: 'center'}}>
                    <b>Yay! You have seen it all</b>
                </p>
            }>
            {items.map(item => (
                <div key={item.id}>
                    <canvas id={`canvas-${item.page}`}></canvas>
                    <MemoPDFRow {...item}></MemoPDFRow> 
                    {/* <PDRAttributes {...item}></PDRAttributes> */}
                </div>
            ))}
        </InfiniteScroll>
    )
}

export default PDFList;