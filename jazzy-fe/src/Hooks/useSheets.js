import { useState, useEffect } from 'react'
import axios from 'axios'
import pdfjs from 'pdfjs-dist/build/pdf'
import {omit} from 'lodash'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const serverURL = process.env.REACT_APP_SERVER_URL

function useSheets(batchNum) {
    const [sheets, setSheets] = useState([])

    useEffect(() => {
        const getPageLoaders = async (sheet) => {
            const pdfData = window.atob(sheet.contents)
            const pdf = await Promise.resolve(pdfjs.getDocument({ data: pdfData }).promise)
            const pageLoaders = Array.from({ length: pdf.numPages })
                .reduce((obj, _, idx) => {
                    obj[idx + 1] = pdf.getPage(idx+1)
                    return obj
                }, {})
            return pageLoaders
        }

        const fetchData = async () => {
            const response = await axios.get(`${serverURL}/pdfs?page=${batchNum}`)

            let newSheets = []
            for (let i = 0; i < response.data.length; i++) {
                const sheet = response.data[i]
                const pageLoaders = await getPageLoaders(sheet)
                newSheets.push({
                    ...omit(sheet, 'contents'),
                    pageLoaders
                })
            }

            setSheets(s => [...s, ...newSheets])
        }

        fetchData()
    }, [batchNum])

    return sheets
}

export default useSheets