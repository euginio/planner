import classNames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import '../styles/Task.css'
import { itemNavigationType } from './Sheet'
import { HourPoint } from './HourPoint'
import type { TaskItemHandlers } from './handlers'

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
   handlers: TaskItemHandlers
   allowedActions: itemNavigationType
   liHour?: number
}) => {
   const taskInputRef = useRef<HTMLInputElement>(null)
   const dragPointerId = useRef<number | null>(null)
   const [isDragging, setIsDragging] = useState(false)

   useEffect(() => {
      if (focus && taskInputRef?.current) taskInputRef.current.focus()
   }, [focus, allowedActions])

   const increaseIndentation = () => handlers.setIndentation(id, indentation + 1)
   const decreaseIndentation = () => {
      if (indentation > 0) handlers.setIndentation(id, indentation - 1)
   }
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

   const handleDragPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!allowedActions.sortable || e.button !== 0) return
      dragPointerId.current = e.pointerId
      if (typeof e.currentTarget.setPointerCapture === 'function') {
         e.currentTarget.setPointerCapture(e.pointerId)
      }
      setIsDragging(true)
      e.preventDefault()
      e.stopPropagation()
   }

   const handleDragPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
      if (dragPointerId.current !== e.pointerId) return

      const source = e.currentTarget.closest<HTMLLIElement>('[data-task-id]')
      const target = e.currentTarget.ownerDocument
         .elementFromPoint(e.clientX, e.clientY)
         ?.closest<HTMLLIElement>('[data-task-id]')
      if (!source || !target || source === target || source.parentElement !== target.parentElement)
         return

      const targetRect = target.getBoundingClientRect()
      const targetId = Number(target.dataset.taskId)
      handlers.reorderTask(id, targetId, e.clientY > targetRect.top + targetRect.height / 2)
   }

   const finishDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
      if (dragPointerId.current !== e.pointerId) return
      dragPointerId.current = null
      setIsDragging(false)
      if (typeof e.currentTarget.releasePointerCapture === 'function') {
         e.currentTarget.releasePointerCapture(e.pointerId)
      }
   }

   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
      if (['Alt', 'Control'].includes(e.key)) {
         e.preventDefault()
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
      <li
         className={classNames('taskHolder', { dragging: isDragging })}
         data-task-id={id}
         onClick={() => handlers.handleOnItemClick(id)}
         onKeyDown={handleInputKeyDown}
      >
         {allowedActions.sortable && allowedActions.dragAndDrop !== false && (
            <button
               type='button'
               className='taskDragHandle'
               aria-label={`Reorder ${text || 'empty task'}`}
               aria-pressed={isDragging}
               onClick={e => e.stopPropagation()}
               onPointerDown={handleDragPointerDown}
               onPointerMove={handleDragPointerMove}
               onPointerUp={finishDrag}
               onPointerCancel={finishDrag}
            >
               <span aria-hidden='true'>⠿</span>
            </button>
         )}
         {liHour && <HourPoint hour={liHour} size={size}></HourPoint>}
         <div
            className={classNames('task', { showSize: size > 1 })}
            style={
               {
                  '--task-indent': `${20 * indentation}px`,
                  '--task-height': `${20 * size}px`,
               } as CSSProperties
            }
         >
            {focus ? (
               <input
                  ref={taskInputRef}
                  readOnly={!allowedActions?.editable}
                  placeholder={allowedActions?.editable && !text ? 'Write a task...' : undefined}
                  onChange={updateText}
                  value={text}
                  className={classNames('taskInput', { crossOut: done })}
               />
            ) : (
               <label className={classNames('taskLabel', { crossOut: done })}>{text || '_'}</label>
            )}
         </div>
      </li>
   )
}

export default TaskComp
