import React from 'react'

import Task from './Task'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
   title: 'Example/Task',
   component: Task,
   // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
   // argTypes: {
   //    backgroundColor: { control: 'color' },
   // },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = args => <Task {...args} />

export const EmptyTask = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
EmptyTask.args = {
   editable: true,
   text: '',
   done: false,
   size: 1,
   relevance: 1,
}

export const CompletedTask = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
CompletedTask.args = {
   editable: false,
   text: 'this task is completed',
   done: true,
   size: 1,
   relevance: 1,
}

export const LargeCompletedTask = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
LargeCompletedTask.args = {
   editable: false,
   text: 'this task is completed and his text is very large lorem ipsum Geringoso saragoa espagueti Otorrino laringólogo estupefacto dinamo emancipado dialecto turro',
   done: true,
   size: 1,
   relevance: 1,
}

export const HeavyLargeCompletedTask = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
HeavyLargeCompletedTask.args = {
   editable: false,
   text: 'this task is completed and his text is very large and his size is 5 lorem ipsum Geringoso saragoa espagueti Otorrino laringólogo estupefacto dinamo emancipado dialecto turro',
   done: true,
   size: 5,
   relevance: 1,
}
