import classNames from 'classnames'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import Sheet from './stories/Sheet'
import './App.css'

export const DEBUGG_MODE = true

function App() {
   const [sheets, setSheets] = useState<Set<string>>(new Set())
   const [sheetsLoaded, setSheetsLoaded] = useState(false)
   const [currentSheet, setCurrentSheet] = useState<string>()
   const LS_SHEETS_KEY = 'App.Sheets'
   const inputAddSheet = useRef<HTMLInputElement>(null)

   useEffect(() => {
      const loadedSheets = JSON.parse(localStorage.getItem(LS_SHEETS_KEY) || '[]')
      if (loadedSheets.length) {
         setSheets(new Set(loadedSheets))
         setCurrentSheet(loadedSheets[0])
      }
      setSheetsLoaded(true)
   }, [])

   useEffect(() => {
      if (sheetsLoaded) localStorage.setItem(LS_SHEETS_KEY, JSON.stringify([...sheets]))
   }, [sheets, sheetsLoaded])

   const handleGlobalInputKeyDown = (e: KeyboardEvent) => {
      if (['Alt', 'Control'].includes(e.key)) {
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

   const handleInputKeyDown = (e: KeyboardEvent) => {
      if (['Alt', 'Control'].includes(e.key)) {
         e.preventDefault() // prevents put prompt at begining
         e.stopPropagation()
      }
      //@ts-ignore
      if (e.key === 'Enter' && inputAddSheet.current.value.trim()) {
         //@ts-ignore
         const inputValue = inputAddSheet.current.value.trim()
         setSheets(prevSheets => new Set(prevSheets).add(inputValue.trim()))
         //@ts-ignore
         inputAddSheet.current.value = ''
      }
   }
   const handleSheetClick = (s: string) => {
      let copy = s
      setCurrentSheet(copy)
   }
   const deleteSheet = (s: string) =>
      setSheets(prevSheets => {
         prevSheets.delete(s)
         return new Set(prevSheets)
      })

   return (
      <div className='appShell' onKeyDown={handleGlobalInputKeyDown}>
         <header className='appHeader'>
            <div className='brand'>
               <span className='brandMark' aria-hidden='true'>
                  P
               </span>
               <span>Daymark</span>
            </div>
            <nav className='sheetNavigation' aria-label='Plans'>
               <ul className='sheetList'>
                  {[...sheets].map(s => (
                     <li key={s} className={classNames({ currentSheet: currentSheet === s })}>
                        <button
                           type='button'
                           className='sheetButton'
                           aria-current={currentSheet === s ? 'page' : undefined}
                           onClick={() => handleSheetClick(s)}
                        >
                           {s}
                        </button>
                        {!currentSheet && (
                           <button
                              type='button'
                              className='removeSheet'
                              aria-label={`Delete ${s} plan`}
                              onClick={() => deleteSheet(s)}
                           >
                              ×
                           </button>
                        )}
                     </li>
                  ))}
                  {currentSheet ? (
                     <li>
                        <button
                           type='button'
                           className='backButton'
                           onClick={() => setCurrentSheet(undefined)}
                        >
                           <span aria-hidden='true'>←</span> All plans
                        </button>
                     </li>
                  ) : (
                     <li className='newSheetItem'>
                        <label className='visuallyHidden' htmlFor='new-plan'>
                           New plan name
                        </label>
                        <input
                           id='new-plan'
                           type='text'
                           ref={inputAddSheet}
                           onKeyDown={handleInputKeyDown}
                           placeholder='+ New plan'
                        />
                     </li>
                  )}
               </ul>
            </nav>
         </header>
         <main className='appMain'>
            {currentSheet ? (
               <Sheet name={currentSheet}></Sheet>
            ) : (
               <section className='welcomePanel'>
                  <span className='eyebrow'>MAKE SPACE FOR WHAT MATTERS</span>
                  <h1>Your plans, in one calm place.</h1>
                  <p>Create a plan to start organizing your tasks and ideas.</p>
               </section>
            )}
         </main>
      </div>
   )
}

export default App
