import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [combo, setCombo] = useState([])
  const [hints, setHints] = useState([0, 1, 1, 1, 1, 1 , 1])
  const [currentIndex, setCurrentIndex] = useState(1)
  const [shownCombo, setShownCombo] = useState([])
  const [answer, setAnswer] = useState('BALL')
  const [input, setInput] = useState('')
  const [guesses, setGuesses] = useState(0)

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
      let shown = newCombo[i].substring(0, tempHints[i]);
      let blanks = '_'.repeat(newCombo[i].length - tempHints[i]);
      newCombo[i] = shown + blanks;
    }

    if (input.length > tempHints[currentIndex]) {
      let comboHint = input.toUpperCase();
      let comboBlanks = '_'.repeat(newCombo[currentIndex].length - input.length);
      newCombo[currentIndex] = comboHint + comboBlanks;
    }

    setShownCombo(newCombo);  
  }, [input])

  const handleSubmit = () => {
    if (input.length != combo[currentIndex].length) {
      return;
    }
    console.log("Input submitted:", input);

    // Correct Answer
    if (input === combo[currentIndex]) {
      let newHints = [...hints];
      newHints[currentIndex] = combo[currentIndex].length;
      setHints(newHints);
      setInput('');
      setCurrentIndex(currentIndex + 1);
      setAnswer(combo[currentIndex]);
      setGuesses(guesses + 1);
    }
    // Incorrect Answer
    else {
      let newHints = [...hints];
      
      // Only increment hint if not already at max
      if (hints[currentIndex] + 1 < combo[currentIndex].length) {
        newHints[currentIndex] = Math.min(newHints[currentIndex] + 1, combo[currentIndex].length);
      }

      setHints(newHints);
      setGuesses(guesses + 1);
    }
  }

  return (
    <div className='app-container flex flex-col items-center justify-center h-screen text-slate-100'>
      <h1 className='absolute text-4xl font-bold text-center top-10'>
        WordCombo |  {new Date().toLocaleDateString()}
      </h1>

      <div className='mt-8'>
        {shownCombo.map((word, index) => (
          <div key={index} className='word-container flex items-center justify-center'>
            <div className='bg-transparent my-2'>
              <h2 className='text-3xl tracking-widest font-semibold'>{word}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className='input-container flex flex-col items-center justify-center mt-6 w-3/5 max-w-md'>
        <input
          className='border-2 border-gray-300 rounded-lg p-2 text-center text-2xl text-slate-700 w-full bg-white'
          type='text'
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
          maxLength={combo[currentIndex]?.length || 10}
        />
        <div className='mt-4 w-full text-left'>
          Guesses: {guesses}
        </div>
      </div>

    </div>
  )
}

export default App
