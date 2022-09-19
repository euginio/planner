import TaskCounter from './TaskCounter'

function TaskInfo({ tasks }) {
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
