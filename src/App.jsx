import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [combo, setCombo] = useState([])
  const [previousWord, setPreviousWord] = useState('')
  const [hints, setHints] = useState([0, 1, 1, 1, 1, 1 , 1])
  const [currentIndex, setCurrentIndex] = useState(1)
  const [shownCombo, setShownCombo] = useState([])
  const [answer, setAnswer] = useState('BALL')
  const [input, setInput] = useState('')

  useEffect(() => {
    setCombo(['SNOW', 'BALL', 'GAME', 'NIGHT', 'CLUB', 'HOUSE', 'PLANT']);
  }, [])

  useEffect(() => {
    if (combo.length === 0) return;

    let newCombo = [...combo];
    let tempHints = [...hints];

    // Cycling through each word in the combo
    for (let i = 1; i < tempHints.length; i++) {
      const shown = newCombo[i].substring(0, tempHints[i]);
      const blanks = '_'.repeat(newCombo[i].length - tempHints[i]);
      newCombo[i] = shown + blanks;
    }

    setShownCombo(newCombo);

    // Initialize input value based on revealed part if first load or index changed
    const base = combo[currentIndex]?.substring(0, tempHints[currentIndex]) ?? '';
    setInput(base);
  }, [combo, hints, currentIndex]);

  const handleInputChange = (e) => {
    const raw = e.target.value.toUpperCase();
    const base = combo[currentIndex].substring(0, hints[currentIndex]);
    let newInput = raw;

    // Ensure input starts with revealed part
    if (!raw.startsWith(base)) {
      newInput = base + raw.slice(base.length).replace(/[^A-Z]/g, '');
    }

    // Trim to answer length
    newInput = newInput.slice(0, combo[currentIndex].length);

    setInput(newInput);
  };

  useEffect(() => {
    if (combo.length === 0) return;

    let newCombo = [...combo];
    let tempHints = [...hints];

    // Cycling through each word in the combo
    for (let i = 1; i < tempHints.length; i++) {
      let comboHints = newCombo[i].substring(0, tempHints[i]);
      let comboBlanks = '_'.repeat(newCombo[i].length - tempHints[i]);
      newCombo[i] = comboHints + comboBlanks;
    }

    if (input.length > tempHints[currentIndex]) {
      let comboHint = input.toUpperCase();
      let comboBlanks = '_'.repeat(newCombo[currentIndex].length - input.length);
      newCombo[currentIndex] = comboHint + comboBlanks;
    }

    setShownCombo(newCombo);  
  }, [input])

  return (
    <div className='app-container flex flex-col items-center justify-center h-screen bg-blue-200'>
      <h1 className='absolute text-5xl font-bold text-center top-15'>
        WordChain
      </h1>

      {shownCombo.map((word, index) => (
        <div key={index} className='word-container flex items-center justify-center'>
          <div className='bg-transparent my-4'>
            <h2 className='text-4xl tracking-widest font-semibold'>{word}</h2>
          </div>
        </div>
      ))}

      <div className='input-container flex items-center justify-center mt-12'>
        <input
          className='border-2 border-gray-300 rounded-lg p-2 text-center text-2xl w-1/ bg-white 3'
          type='text'
          value={input}
          onChange={handleInputChange}
          maxLength={combo[currentIndex]?.length || 10}
          placeholder={previousWord}
        />
      </div>
    </div>
  )
}

export default App
