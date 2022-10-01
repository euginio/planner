import { DEBUGG_MODE } from '../App'
import TaskComp from './TaskComp'
import TaskInfo from './TaskInfo'
import './DummyList.css'
import { Task } from './List'
import { itemNavigationType } from './Sheet'

const DummyList = ({
   list,
   name,
   itemHandlers,
   allowedActions,
   visible,
}: {
   list: Task[]
   name: string
   itemHandlers: { [key: string]: (...a: any) => void }
   allowedActions: itemNavigationType
   visible: boolean
}) => {
   let liHour = 8.5
   return (
      <>
         <h3 style={{ display: 'inline' }}>{name}</h3>
         {visible && DEBUGG_MODE && <TaskInfo tasks={list}></TaskInfo>}
         {visible && (
            <ol>
               {list.map(t => {
                  const renderr = (
                     <TaskComp
                        key={t.id}
                        {...t}
                        handlers={itemHandlers}
                        allowedActions={allowedActions}
                        liHour={liHour}
                     ></TaskComp>
                  )
                  liHour += t.size * 0.5
                  return renderr
               })}
            </ol>
         )}
      </>
   )
}

export default DummyList
