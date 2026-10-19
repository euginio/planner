import TaskComp from './TaskComp'
import ListInfo from './TaskInfo'
import './DummyList.css'
import { Task } from './List'
import { ListConf } from './Sheet'
import { helper } from '../helper'
import type { TaskItemHandlers } from './handlers'

const DummyList = ({
   list,
   name,
   itemHandlers,
   listConfig,
   visible,
}: {
   list: Task[]
   name: string
   itemHandlers: TaskItemHandlers
   listConfig: ListConf
   visible: boolean
}) => {
   let liHour = 1

   return (
      <>
         <h3 className='taskListHeading'>
            {listConfig.listLook.lapse === 'day' && listConfig.listLook.showLapseName
               ? helper.getWeekDay()
               : name}
         </h3>
         {visible && listConfig.listLook.showListInfo && <ListInfo list={list}></ListInfo>}
         {visible && (
            <ol className='taskItems'>
               {list.map(t => {
                  const renderr = (
                     <TaskComp
                        key={t.id}
                        {...t}
                        handlers={itemHandlers}
                        allowedActions={listConfig.itemsNavigation}
                        {...(listConfig.listLook.lapse ? { liHour: liHour } : {})}
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
