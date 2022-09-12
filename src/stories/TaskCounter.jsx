function TaskCounter({ tasks, condition, children }) {
   return (
      children +
      ' ' +
      tasks
         .filter(condition)
         .map(t => t.size)
         .reduce((prev, curr) => prev + curr, 0)
   )
}

export default TaskCounter
