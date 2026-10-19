import './Introduction.css'

export default {
   title: 'Planner/Introduction',
}

export const Overview = () => (
   <main className='storyIntroduction'>
      <p className='storyIntroductionEyebrow'>
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
