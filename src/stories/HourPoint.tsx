import classNames from 'classnames'
import { useEffect, useState } from 'react'

export const HourPoint = ({ hour, size }: { hour: number; size: number }) => {
   const init = new Date()
   const [date, setDate] = useState(init)

   const tick = () => {
      setDate(new Date())
   }

   useEffect(() => {
      const timerID = setInterval(() => tick(), 1000)
      return () => {
         clearInterval(timerID)
      }
   }, [])

   const minutes = date.getMinutes()
   const hours = date.getHours()
   const currentHour = hours + minutes / 60
   const hoursPassed = currentHour - hour
   const isInMyTimeRange = currentHour >= hour && hoursPassed < size / 2
   return (
      <span className='hourLabel'>
         {(!isInMyTimeRange || (size > 1 && hoursPassed >= 0.5)) && (
            <>
               {Number.parseInt(hour.toString())}:
               {Number.isInteger(hour) ? <>&nbsp;&nbsp;&nbsp;&nbsp;</> : '30'}
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
                  // top: (hoursPassed >= 1 ? hoursPassed : 0) * 1.4 + 'em',
                  // top: 20 * 2 * hoursPassed - 30,
                  top: hoursPassed >= 1 ? hoursPassed * 43 - 43 : 0,
               }}
            >
               {hours}:{minutes < 10 ? '0' : ''}
               {minutes}
            </span>
         )}
      </span>
   )
}
