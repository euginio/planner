export default {
   title: 'Planner/Introduction',
}

export const Overview = () => (
   <main style={{ maxWidth: 680, padding: 32, color: '#1f3432', fontFamily: 'Segoe UI, sans-serif' }}>
      <p style={{ color: '#668e80', fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>
         PLANNER COMPONENTS
      </p>
      <h1>Explore the planner in isolation</h1>
      <p>
         Use the stories in the sidebar to inspect task states and interactions without the rest of
         the planner.
      </p>
      <h2>Keyboard-first task management</h2>
      <p>
         Tasks support editing, completion, indentation, resizing, and reordering. The available
         actions depend on the list configuration.
      </p>
      <h2>Stories</h2>
      <ul>
         <li>
            <strong>Task</strong> shows empty, completed, and resized task examples.
         </li>
         <li>
            <strong>Planner components</strong> introduces this Storybook workspace.
         </li>
      </ul>
   </main>
)
