import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'
import { DEBUGG_MODE } from '../App'
import './Task.css'
import { itemNavigationType } from './Sheet'

const TaskComp = ({
   id,
   focus = false,
   text = '',
   done = false,
   size = 1,
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
   impact: number
   handlers: { [key: string]: (...a: any) => void }
   allowedActions: itemNavigationType
   liHour: number
}) => {
   const taskInputRef = useRef<HTMLInputElement>(null)

   useEffect(() => {
      if (focus && taskInputRef?.current) taskInputRef.current.focus()
   }, [focus, allowedActions])

   const increaseSize = () => handlers.setSize(id, size + 1)
   const decreaseSize = () => {
      if (size > 1) handlers.setSize(id, size - 1)
   }
   const updateText = () => {
      handlers.setText(id, taskInputRef.current?.value ? taskInputRef.current.value : '')
   }
   const swipeDone = () => handlers.setDone(id, !done)

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
   }

   const minutes = new Date().getMinutes()
   const hours = new Date().getHours()
   const currentHour = hours + minutes / 60
   const hoursPassed = currentHour - liHour
   const isInMyTimeRange = currentHour >= liHour && hoursPassed < size / 2
   return (
      <>
         <li
            className={classNames('taskHolder')}
            onClick={() => handlers.handleOnItemClick(id)}
            onKeyDown={handleInputKeyDown}
         >
            <span className='hourLabel'>
               {(!isInMyTimeRange || (size > 1 && hoursPassed >= 0.5)) && (
                  <>
                     {Number.parseInt(liHour.toString())}:
                     {Number.isInteger(liHour) ? <>&nbsp;&nbsp;&nbsp;&nbsp;</> : '30'}
                     &nbsp;&nbsp;&nbsp;
                  </>
               )}
               {isInMyTimeRange && (
                  <span
                     className={classNames('currentHour', {
                        floatLeft: hoursPassed >= 0.5,
                     })}
                     style={{
                        position: 'relative',
                        top: (hoursPassed >= 1 ? hoursPassed : 0) * 1.4 + 'em',
                     }}
                  >
                     {hours}:{minutes < 10 ? '0' : ''}
                     {minutes}
                  </span>
               )}
            </span>
            <div
               className={classNames({ showSize: size > 1 })}
               style={{ height: 20 * size + 'px', display: 'inline-block', width: '90%' }}
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
