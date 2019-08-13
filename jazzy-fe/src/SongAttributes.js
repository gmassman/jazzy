import React, { useState } from 'react'

const Input = ({ value, onChangeInput, children }) => (
    <label>
        {children}
        <input type="text" value={value} onChange={onChangeInput} />
    </label>
)

function SongAttributes({activePDF}){
    const [currentPDF, setCurrentPDF] = useState(activePDF)

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

    return (
        <>
            <Input value={currentPDF.song} onChangeInput={handleSongChange}>
                Song:
            </Input>
            <Input value={currentPDF.composer} onChangeInput={handleComposerChange}>
                Composer:
            </Input>
        </>
    )
}

export default SongAttributes