import classNames from 'classnames'

export const HourPoint = ({ hour, size }: { hour: number; size: number }) => {
   const minutes = new Date().getMinutes()
   const hours = new Date().getHours()
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
                  top: (hoursPassed >= 1 ? hoursPassed : 0) * 1.4 + 'em',
               }}
            >
               {hours}:{minutes < 10 ? '0' : ''}
               {minutes}
            </span>
         )}
      </span>
   )
}
