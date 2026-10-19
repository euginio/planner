import classNames from 'classnames'
import { useState, useRef, useEffect, useCallback } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import Sheet from './stories/Sheet'
import presetListConf from './stories/presetListConf.json'
import { createBackup, importBackup } from './backup'
import { deletePlan, PLAN_NAMES_STORAGE_KEY } from './planStorage'
import { migrateStorage } from './storageMigrations'
import {
   isSheetNameList,
   readStoredJson,
   readStoredValue,
   writeStoredJson,
   writeStoredValue,
} from './storage'
import './styles/App.css'

const AUTOMATIC_BACKUP_DATE_KEY = 'App.LastAutomaticBackupDate'
const LS_SHEETS_KEY = PLAN_NAMES_STORAGE_KEY
const listNames = Object.keys(presetListConf)

function getLocalDateKey(date: Date) {
   const year = date.getFullYear()
   const month = String(date.getMonth() + 1).padStart(2, '0')
   const day = String(date.getDate()).padStart(2, '0')
   return `${year}-${month}-${day}`
}

function App() {
   const [sheets, setSheets] = useState<Set<string>>(new Set())
   const [sheetsLoaded, setSheetsLoaded] = useState(false)
   const [sheetsDataValid, setSheetsDataValid] = useState(false)
   const [currentSheet, setCurrentSheet] = useState<string>()
   const [backupMessage, setBackupMessage] = useState<{ text: string; isError: boolean }>()
   const [storageErrors, setStorageErrors] = useState<Record<string, string>>({})
   const inputImportBackup = useRef<HTMLInputElement>(null)
   const reportStorageError = useCallback((key: string, message?: string) => {
      setStorageErrors(current => {
         if (!message) {
            const { [key]: _removed, ...remaining } = current
            return remaining
         }
         return { ...current, [key]: message }
      })
   }, [])
   const hasStorageErrors = Object.keys(storageErrors).length > 0

   useEffect(() => {
      try {
         migrateStorage(localStorage)
         const loadedSheets = readStoredJson(localStorage, LS_SHEETS_KEY, [], isSheetNameList)
         setSheetsDataValid(true)
         reportStorageError(LS_SHEETS_KEY)
         if (loadedSheets.length) {
            setSheets(new Set(loadedSheets))
            setCurrentSheet(loadedSheets[0])
         }
         setSheetsLoaded(true)
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error)
         setSheetsDataValid(false)
         reportStorageError(LS_SHEETS_KEY, `${message} Import a backup to recover your plans.`)
         setSheetsLoaded(true)
      }
   }, [reportStorageError])

   useEffect(() => {
      if (!sheetsLoaded || !sheetsDataValid) return
      try {
         writeStoredJson(localStorage, LS_SHEETS_KEY, [...sheets])
         reportStorageError(LS_SHEETS_KEY)
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error)
         reportStorageError(LS_SHEETS_KEY, `${message} Your latest plan changes may not be saved.`)
      }
   }, [sheets, sheetsLoaded, sheetsDataValid, reportStorageError])

   const handleGlobalInputKeyDown = (e: KeyboardEvent) => {
      if (['Alt', 'Control'].includes(e.key)) {
         e.preventDefault()
         e.stopPropagation()
      }
      if (e.ctrlKey && ['PageDown', 'PageUp'].includes(e.key)) {
         const idxMove = e.key === 'PageDown' ? 1 : -1
         const sheetArray = [...sheets]
         const currentSheetIdx = sheetArray.findIndex(s => s === currentSheet)
         setCurrentSheet(sheetArray[currentSheetIdx + idxMove])
         e.preventDefault()
         e.stopPropagation()
      }
   }

   const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (['Alt', 'Control'].includes(e.key)) {
         e.preventDefault()
         e.stopPropagation()
      }
      const input = e.currentTarget
      if (e.key === 'Enter' && sheetsDataValid && input.value.trim()) {
         const inputValue = input.value.trim()
         setSheets(current => new Set([...current, inputValue]))
         input.value = ''
      }
   }
   const handleSheetClick = (s: string) => {
      setCurrentSheet(s)
   }
   const deleteSheet = (s: string) => {
      if (!sheetsDataValid) return
      try {
         const updatedSheets = deletePlan(localStorage, s, [...sheets], listNames)
         setSheets(new Set(updatedSheets))
         reportStorageError(LS_SHEETS_KEY)
         listNames.forEach(listName => reportStorageError(`${s}.${listName}`))
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error)
         reportStorageError(LS_SHEETS_KEY, message)
      }
   }

   const downloadBackup = (planNames: string[]) => {
      const backup = createBackup(localStorage, planNames, listNames)
      const url = URL.createObjectURL(new Blob([backup], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `daymark-backup-${getLocalDateKey(new Date())}.json`
      document.body.appendChild(link)
      try {
         link.click()
      } finally {
         link.remove()
         URL.revokeObjectURL(url)
      }
   }

   const handleExportBackup = () => {
      if (!sheetsDataValid) return
      try {
         downloadBackup([...sheets])
         setBackupMessage({
            text: 'Backup download started. Check your Downloads folder.',
            isError: false,
         })
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error)
         setBackupMessage({ text: `Could not export backup: ${message}`, isError: true })
         return
      }

      try {
         writeStoredValue(localStorage, AUTOMATIC_BACKUP_DATE_KEY, getLocalDateKey(new Date()))
         reportStorageError(AUTOMATIC_BACKUP_DATE_KEY)
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error)
         reportStorageError(
            AUTOMATIC_BACKUP_DATE_KEY,
            `${message} The backup download started, but its daily-download marker could not be saved.`
         )
      }
   }

   useEffect(() => {
      if (!sheetsLoaded || !sheets.size) return

      const today = getLocalDateKey(new Date())
      let lastBackupDate: string | null
      try {
         lastBackupDate = readStoredValue(localStorage, AUTOMATIC_BACKUP_DATE_KEY)
         reportStorageError(AUTOMATIC_BACKUP_DATE_KEY)
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error)
         reportStorageError(AUTOMATIC_BACKUP_DATE_KEY, message)
         return
      }
      if (lastBackupDate === today) return

      try {
         downloadBackup([...sheets])
         setBackupMessage({
            text: 'Daily backup download started. Check Downloads; if it was blocked, use Export backup.',
            isError: false,
         })
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error)
         setBackupMessage({
            text: `Could not create daily backup: ${message}. Use Export backup to try again.`,
            isError: true,
         })
         return
      }
      try {
         writeStoredValue(localStorage, AUTOMATIC_BACKUP_DATE_KEY, today)
         reportStorageError(AUTOMATIC_BACKUP_DATE_KEY)
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error)
         reportStorageError(
            AUTOMATIC_BACKUP_DATE_KEY,
            `${message} The daily backup download started, but its marker could not be saved.`
         )
      }
   }, [sheets, sheetsLoaded, reportStorageError])

   const handleImportBackup = async (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget
      const file = input.files?.[0]
      if (!file) return

      try {
         const importedSheets = importBackup(
            await file.text(),
            localStorage,
            [...sheets],
            listNames
         )
         setSheets(new Set(importedSheets))
         setCurrentSheet(undefined)
         setSheetsDataValid(true)
         setStorageErrors({})
         setBackupMessage({
            text: 'Backup restored. Matching plans were replaced; other plans were kept.',
            isError: false,
         })
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error)
         setBackupMessage({ text: `Could not import backup: ${message}`, isError: true })
      } finally {
         input.value = ''
      }
   }

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
                        {!currentSheet && sheetsDataValid && (
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
                           onKeyDown={handleInputKeyDown}
                           placeholder='+ New plan'
                           disabled={!sheetsDataValid}
                        />
                     </li>
                  )}
               </ul>
            </nav>
            <div className='backupActions'>
               <button
                  type='button'
                  onClick={handleExportBackup}
                  disabled={!sheetsLoaded || !sheetsDataValid}
               >
                  Export backup
               </button>
               <button
                  type='button'
                  onClick={() => inputImportBackup.current?.click()}
                  disabled={!sheetsLoaded}
               >
                  Import backup
               </button>
               <input
                  ref={inputImportBackup}
                  type='file'
                  hidden
                  accept='.json,application/json'
                  onChange={handleImportBackup}
               />
            </div>
         </header>
         {hasStorageErrors && (
            <p className='backupMessage backupError' role='alert'>
               {Object.values(storageErrors).join(' ')}
            </p>
         )}
         {backupMessage && (
            <p
               className={`backupMessage${backupMessage.isError ? ' backupError' : ''}`}
               role={backupMessage.isError ? 'alert' : 'status'}
            >
               {backupMessage.text}
            </p>
         )}
         <main className='appMain'>
            {currentSheet ? (
               <Sheet name={currentSheet} onStorageError={reportStorageError}></Sheet>
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
