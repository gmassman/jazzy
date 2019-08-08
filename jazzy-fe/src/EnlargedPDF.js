import React from 'react';

function EnlargedPDF({
    id,
    onClick
}) {
    return (
        !!id ?
            <p onClick={onClick}>Hello</p> : 
            <div></div>
    )
}

export default EnlargedPDF;