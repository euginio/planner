import { DEBUGG_MODE } from '../App'
import TaskComp from './TaskComp'
import ListInfo from './TaskInfo'
import './DummyList.css'
import { Task } from './List'
import { ListConf } from './Sheet'
import { helper } from '../helper'

const DummyList = ({
   list,
   name,
   itemHandlers,
   listConfig,
   visible,
}: {
   list: Task[]
   name: string
   itemHandlers: { [key: string]: (...a: any) => void }
   listConfig: ListConf
   visible: boolean
}) => {
   let liHour = 1

   return (
      <>
         <h3 style={{ display: 'inline' }}>
            {listConfig.listLook.lapse === 'day' && listConfig.listLook.showLapseName
               ? helper.getWeekDay()
               : name}
         </h3>
         {visible && listConfig.listLook.showListInfo && DEBUGG_MODE && (
            <ListInfo list={list}></ListInfo>
         )}
         {visible && (
            <ol className='itemList'>
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
