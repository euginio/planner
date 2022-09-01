import { useState } from 'react'
import Sheet from './Sheet'

function App() {
   const [sheets, setSheets] = useState([])

   return (
      <>
         <Sheet name='today' />
         {/* <Sheet name='week' /> */}
      </>
   )
}

export default App
