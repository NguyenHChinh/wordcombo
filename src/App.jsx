import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabase'
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

export async function fetchTodayCombo() {
  const today = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD' in local time

  const { data, error } = await supabase
    .from('combos')
    .select('words')
    .eq('combo_date', today)
    .single();

  if (error) throw error;
  return data.words;
}

const todayKey = new Date().toISOString().split('T')[0];

function App() {
  const [combo, setCombo] = useState([])
  const [hints, setHints] = useState([0, 0, 0, 0, 0, 0 , 0])
  const [currentIndex, setCurrentIndex] = useState(1)
  const [shownCombo, setShownCombo] = useState([])
  const [input, setInput] = useState('')
  const [guesses, setGuesses] = useState(0)
  const [evaluation, setEvaluation] = useState('')
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMenu, setGameOverMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const shakeTimeoutRef = useRef(null);

  useEffect(() => {
    async function loadCombo() {
      try {
        const words = await fetchTodayCombo();
        setCombo(words);

        const savedGame = JSON.parse(localStorage.getItem(`wordcombo-${todayKey}`));

        if (savedGame && savedGame.combo?.join(',') === words.join(',')) {
          setHints(savedGame.hints);
          setCurrentIndex(savedGame.currentIndex);
          setGuesses(savedGame.guesses);
          setGameOver(savedGame.gameOver);
          setGameOverMenu(savedGame.gameOverMenu);
        }
      } catch (err) {
        console.error("Failed to fetch today's combo:", err.message);
        setCombo(['NOOO', 'NOOO', 'NOOO', 'NOOO', 'NOOO', 'NOOO', 'NOOO']);
      } finally {
        setLoading(false);
      }
    }

    loadCombo();
  }, []);


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
        setGameOverMenu(true);

        const stats = JSON.parse(localStorage.getItem('wordcombo-stats') || '{}');
        stats[todayKey] = {
          guesses: guesses + 1,
          completed: true,
        };
        localStorage.setItem('wordcombo-stats', JSON.stringify(stats));
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

  // Save game state to localStorage
  useEffect(() => {
    if (combo.length === 0) return;

    const saveData = {
      combo,
      hints,
      currentIndex,
      guesses,
      gameOver,
      gameOverMenu
    };

    localStorage.setItem(`wordcombo-${todayKey}`, JSON.stringify(saveData));
  }, [combo, hints, currentIndex, guesses, gameOver, gameOverMenu]);

  const handleShare = () => {
    const text = `I finished today's WordCombo in ${guesses} guess${guesses !== 1 ? 'es' : ''}! 🧩 🎉\nGive it a try at https://wordcombo.app`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return <div className="text-slate-100 text-center mt-10">Loading today's combo...</div>;
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
      <div className='main-container inset-shadow-sm/50 flex flex-col items-center justify-center mt-8 w-full max-w-sm bg-slate-600 rounded-xl p-8'>
        <div className='combo-container'>
          {shownCombo.map((word, index) => (
            <div
              key={index}
              className={`word-container flex items-center justify-center rounded-xl px-10 py-.5 m-3 transition-all duration-300 shadow-lg/25
                ${
                  gameOver
                    ? 'bg-slate-800'
                    : index === currentIndex
                    ? `scale-110 bg-slate-800 ${evaluation}`
                    : index === currentIndex - 1
                    ? 'scale-105 bg-slate-700'
                    : 'bg-slate-400'
                }
                `}>
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

        {/* Menu Back Up */}
        {gameOver && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setGameOverMenu(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xl font-semibold px-4 py-2 rounded-xl shadow-lg transition-colors"
            >
              📝 View Results
            </button>
          </div>
        )}
      </div>

      {gameOverMenu && (
        <div className="absolute flex flex-col items-center justify-center bg-slate-900 text-white p-16 rounded-4xl shadow-lg/25">
          <h1 className="text-4xl md:text-4xl font-bold text-green-400 mb-4">🎉 Congratulations! 🎉</h1>
          <p className="text-lg md:text-xl mb-6 text-center">You completed the word combo!</p>

          <div className="bg-slate-800 p-6 rounded-2xl shadow-lg mb-6 w-full max-w-md text-center">
            <p className="text-xl font-semibold text-yellow-300">Guesses: <span className="text-white">{guesses}</span></p>
          </div>

          <p className="text-sm text-slate-400 mb-6">Come back tomorrow for a new challenge!</p>

          <div className="flex gap-4">
            <button
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl text-white font-semibold relative"
              onClick={handleShare}
            >
              📤 {copied ? 'Copied!' : 'Share'}
            </button>
            <button
              className="bg-slate-700 hover:bg-slate-800 px-4 py-2 rounded-xl text-white font-semibold"
              onClick={() => setGameOverMenu(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
