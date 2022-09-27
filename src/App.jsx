import { useState, useRef, useEffect } from 'react'
import Sheet from './stories/Sheet'
export const DEBUGG_MODE = true

function App() {
   const [sheets, setSheets] = useState(new Set())
   const [currentSheet, setCurrentSheet] = useState()
   const LS_SHEETS_KEY = 'App.Sheets'
   const inputAddSheet = useRef()

   useEffect(() => {
      // if (sheets.length > 0 && !currentSheet) setCurrentSheet(sheets[0])
      const loadedSheets = JSON.parse(localStorage.getItem(LS_SHEETS_KEY))
      if (loadedSheets && Object.keys(loadedSheets).length) {
         setSheets(new Set(loadedSheets))
         setCurrentSheet('today')
      }
   }, [])

   useEffect(() => {
      if (sheets.size) localStorage.setItem(LS_SHEETS_KEY, JSON.stringify([...sheets]))
   }, [sheets])

   const handleGlobalInputKeyDown = e => {
      if (e.key === 'Control') {
         e.preventDefault() // prevents put prompt at begining
         e.stopPropagation()
      }
      if (e.ctrlKey && ['PageDown', 'PageUp'].includes(e.key)) {
         const idxMove = e.key === 'PageDown' ? 1 : -1
         const sheetArray = [...sheets]
         const currentSheetIdx = sheetArray.findIndex(s => s === currentSheet)
         setCurrentSheet(sheetArray[currentSheetIdx + idxMove])
         e.preventDefault() // prevents put prompt at begining
         e.stopPropagation()
      }
   }

   const handleInputKeyDown = e => {
      if (e.key === 'Enter' && inputAddSheet.current.value.trim()) {
         const inputValue = inputAddSheet.current.value.trim()
         setSheets(prevSheets => new Set(prevSheets).add(inputValue.trim()))
         inputAddSheet.current.value = ''
      }
   }
   const handleSheetClick = s => {
      let copy = s
      setCurrentSheet(copy)
   }
   const deleteSheet = s =>
      setSheets(prevSheets => {
         prevSheets.delete(s)
         return new Set(prevSheets)
      })

   return (
      <div onKeyDown={handleGlobalInputKeyDown}>
         <ul className='sheetList'>
            {[...sheets].map(s => (
               <li key={s}>
                  <a href='#' onClick={() => handleSheetClick(s)}>
                     {s}
                  </a>
                  {!currentSheet && (
                     <a href='#' className='remove' onClick={() => deleteSheet(s)}>
                        X
                     </a>
                  )}
               </li>
            ))}
            {currentSheet ? (
               <li onClick={() => setCurrentSheet(null)}>
                  <a href='#'> {'<--'}</a>
               </li>
            ) : (
               <li>
                  <a>
                     <input type='text' ref={inputAddSheet} onKeyDown={handleInputKeyDown} />
                  </a>
               </li>
            )}
         </ul>
         {currentSheet && <Sheet name={currentSheet}></Sheet>}
      </div>
   )
}

export default App
