import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'
import { DEBUGG_MODE } from '../App'
import './Task.css'
import { itemNavigationType } from './Sheet'
import { HourPoint } from './HourPoint'

const TaskComp = ({
   id,
   focus = false,
   text = '',
   done = false,
   size = 1,
   indentation = 0,
   impact = 1,
   handlers,
   allowedActions,
   liHour,
}: {
   id: number
   focus: boolean
   text: string
   done: boolean
   size: number
   indentation: number
   impact: number
   handlers: { [key: string]: (...a: any) => void }
   allowedActions: itemNavigationType
   liHour?: number
}) => {
   const taskInputRef = useRef<HTMLInputElement>(null)

   useEffect(() => {
      if (focus && taskInputRef?.current) taskInputRef.current.focus()
   }, [focus, allowedActions])

   const increaseIndentation = () => handlers.setIndentation(id, indentation + 1)
   const decreaseIndentation = () => handlers.setIndentation(id, indentation - 1)
   const increaseSize = () => handlers.setSize(id, size + 1)
   const decreaseSize = () => {
      if (size > 1) handlers.setSize(id, size - 1)
   }
   const updateText = () => {
      handlers.setText(id, taskInputRef.current?.value ? taskInputRef.current.value : '')
   }
   const swipeDone = () => handlers.setDone(id, !done)
   const toUpperCase = () => handlers.setText(id, text.toUpperCase())
   const toLowerCase = () => handlers.setText(id, text.toLowerCase())

   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
      //['ctrlKey', 'shiftKey', 'altKey', 'metaKey']
      if (['Alt', 'Control'].includes(e.key)) {
         e.preventDefault() // prevents put prompt at begining
         e.stopPropagation()
      }
      if (e.key === 'Enter') {
         if (e.altKey && allowedActions.completable) {
            swipeDone()
            e.stopPropagation()
         }
      }
      if (allowedActions.indentable) {
         if (e.key === 'Tab') {
            if (e.shiftKey) decreaseIndentation()
            else increaseIndentation()
            e.preventDefault()
            e.stopPropagation()
         }
      }
      if (e.ctrlKey && allowedActions.sizeable) {
         if (e.key === 'ArrowUp') {
            increaseSize()
            e.preventDefault()
            e.stopPropagation()
         }
         if (e.key === 'ArrowDown') {
            decreaseSize()
            e.preventDefault()
            e.stopPropagation()
         }
      }
      if (e.shiftKey) {
         if (e.key === 'ArrowUp') {
            toUpperCase()
            e.preventDefault()
            e.stopPropagation()
         }
         if (e.key === 'ArrowDown') {
            toLowerCase()
            e.preventDefault()
            e.stopPropagation()
         }
      }
   }

   return (
      <>
         <li
            className={classNames('taskHolder')}
            onClick={() => handlers.handleOnItemClick(id)}
            onKeyDown={handleInputKeyDown}
         >
            {liHour && <HourPoint hour={liHour} size={size}></HourPoint>}
            <div
               className={classNames('task', { showSize: size > 1 })}
               style={{
                  left: 20 * indentation,
                  height: 20 * size,
               }}
            >
               {focus ? (
                  <input
                     ref={taskInputRef}
                     readOnly={!allowedActions?.editable}
                     onChange={updateText}
                     value={text}
                     className={classNames('taskInput', {
                        crossOut: done,
                        labeledInput: !DEBUGG_MODE,
                     })}
                  />
               ) : (
                  <label className={classNames('taskLabel', { crossOut: done })}>
                     {text || '_'}
                  </label>
               )}
            </div>
         </li>
      </>
   )
}

export default TaskComp
