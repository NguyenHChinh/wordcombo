import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [combo, setCombo] = useState([])

  useEffect(() => {
    setCombo(['SNOW', 'BALL', 'GAME', 'NIGHT', 'CLUB', 'HOUSE', 'PLANT']);
  }, [])

  return (
    <div className='app-container flex flex-col items-center justify-center h-screen bg-blue-200'>
      <h1 className='absolute text-5xl font-bold text-center top-15'>
        WordChain
      </h1>

      {combo.map((word, index) => (
        <div key={index} className='word-container flex items-center justify-center'>
          <div className='bg-transparent my-4'>
            <h2 className='text-4xl tracking-widest font-semibold'>{word}</h2>
          </div>
        </div>
      ))}


    </div>
  )
}

export default App
