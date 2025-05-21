import { useEffect, useState, useRef } from 'react'
import './App.css'

function formatDate(date) {
  const options = { month: 'short' };
  const day = date.getDate();
  const dayWithSuffix = day + getDaySuffix(day);
  const month = date.toLocaleString('en-US', options);
  const year = date.getFullYear();
  return `${month} ${dayWithSuffix}, ${year}`;
}

function getDaySuffix(day) {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function App() {
  const [combo, setCombo] = useState([])
  const [hints, setHints] = useState([0, 1, 1, 1, 1, 1 , 1])
  const [currentIndex, setCurrentIndex] = useState(1)
  const [shownCombo, setShownCombo] = useState([])
  const [input, setInput] = useState('')
  const [guesses, setGuesses] = useState(0)
  const [evaluation, setEvaluation] = useState('')
  const [gameOver, setGameOver] = useState(false);

  const shakeTimeoutRef = useRef(null);

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

    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = null;
    }
    setEvaluation("");

    // Correct Answer
    if (input === combo[currentIndex]) {
      let newHints = [...hints];
      newHints[currentIndex] = combo[currentIndex].length;
      setHints(newHints);
      setInput('');
      setCurrentIndex(currentIndex + 1);
      setGuesses(guesses + 1);

      if (currentIndex == combo.length - 1) {
        setCurrentIndex(1000);
        setGameOver(true);
      }
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

      setTimeout(() => {
        setEvaluation("shake");

        if (shakeTimeoutRef.current) {
          clearTimeout(shakeTimeoutRef.current);
        }

        shakeTimeoutRef.current = setTimeout(() => {
          setEvaluation("");
          shakeTimeoutRef.current = null;
        }, 3000);
      }, 0);
    }
  }

  return (
    <div className='app-container flex flex-col items-center justify-center text-slate-100'>
      {/* Header */}
      <div className='header-container border-b-2 border-slate-500 w-full max-w-md p-8'>
        <h1 className='text-5xl text-center mt-2'>
          <span className='font-bold tracking-wide'>WordCombo</span><span className='text-slate-500 tracking-tight'>.app</span>
        </h1>
        <h1 className='text-2xl text-center mt-2'>
          {formatDate(new Date())}
        </h1>
      </div>

      {/* Main Content */}
      <div className='main-container flex flex-col items-center justify-center mt-8 w-full max-w-md bg-slate-600 rounded-xl p-8'>
        <div className='combo-container'>
          {shownCombo.map((word, index) => (
            <div
              key={index}
              className={`word-container flex items-center justify-center ${(index === currentIndex) ? `scale-110 bg-slate-800 + ${evaluation}` : ''} ${index === currentIndex - 1 ? 'scale-105 bg-slate-700' : 'bg-slate-400'} rounded-xl px-10 py-.5 m-3 transition-all duration-300`}>
              <div className='bg-transparent my-2'>
                <h2 className='text-3xl tracking-widest font-semibold'>{word}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* Input Field */}
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

          <div className='mt-2 w-full text-left'>
            Guesses: {guesses}
          </div>
        </div>
      </div>

      {gameOver && (
        <div className='absolute w-3/5 h-2/5 bg-slate-700 rounded-xl flex flex-col items-center justify-center'>
          <button
              onClick={() => setGameOver(false)}
              className="absolute top-5 right-5 text-xs sm:text-sm md:text-base font-medium text-gray-300 hover:text-red-400 border border-gray-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded">
              Close
          </button>
          <h2 className='text-2xl font-bold text-center mb-4'>Today solved!</h2>
          <p className='text-lg px-6 text-center'>You completed the combo in {guesses} guesses!</p>
        </div>
      )}
    </div>
  )
}

export default App
