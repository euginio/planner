import { Task } from './List'
import TaskCounter from './TaskCounter'

function TaskInfo({ tasks }: { tasks: Task[] }) {
   return (
      <p style={{ display: 'inline' }}>
         <TaskCounter tasks={tasks} condition={t => !t.done}>
            pending
         </TaskCounter>
         --
         <TaskCounter tasks={tasks} condition={t => t.done}>
            done
         </TaskCounter>
      </p>
   )
}

export default TaskInfo
