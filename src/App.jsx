
import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabase'
import { logEvent } from './utils/analytics'
import HowToPlayModal from './HowToPlayModal.jsx'
import AboutModal from './AboutModal.jsx'
import PrivacyModal from './PrivacyModal.jsx'
import './App.css'

// Function to format the date in "MMM DDth, YYYY" format
function formatDate(date) {
  const options = { month: 'long' };
  const day = date.getDate();
  const dayWithSuffix = day + getDaySuffix(day);
  const month = date.toLocaleString('en-US', options);
  const year = date.getFullYear();
  return `${month} ${dayWithSuffix}, ${year}`;
}

// Function to get the appropriate suffix for the day
function getDaySuffix(day) {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Function to fetch today's combo from Supabase
async function fetchTodayCombo() {

  const { data, error } = await supabase
    .from('combos')
    .select('words')
    .eq('combo_date', todayKey)
    .single();

  if (error) throw error;

  return data.words;
}

// Calculate the current streak based on localStorage
function calculateStreak() {
  let count = 0;
  for (let i = 0; ; i++) {
    const dt = new Date(Date.now() - i * 864e5);
    const key = `wordcombo-${dt.toLocaleDateString('en-CA')}`;
    const data = JSON.parse(localStorage.getItem(key));
    if (data?.gameOver) count++;
    else break;
  }
  return count;
}

const todayKey = new Date().toLocaleDateString('en-CA'); 

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
  const [showModal, setShowModal] = useState(false);
  const [streak, setStreak] = useState(0);

  // About and Privacy Modals
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const shakeTimeoutRef = useRef(null);

  // Initial mount
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
        // TODO: Load a default combo instead of this
        setCombo(['Error!', 'Error!', 'Error!', 'Error!', 'Error!', 'Error!', 'Error!']);
      } finally {
        setLoading(false);
      }
    }

    loadCombo();

    const seenTutorial = localStorage.getItem('seenTutorial');
    if (!seenTutorial) {
      setShowModal(true);
      localStorage.setItem('seenTutorial', 'true');
    }

    // Dedupe "visit" once per calendar day
    const visitKey = `wordcombo-visit-${todayKey}`;
    if (!localStorage.getItem(visitKey)) {
      logEvent('visit');
      localStorage.setItem(visitKey, '1');
    }
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

    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = null;
    }
    setEvaluation("");

    // Dedupe "attempt" once per day
    const attemptKey = `wordcombo-attempt-${todayKey}`;
    if (!localStorage.getItem(attemptKey)) {
      logEvent('attempt');
      localStorage.setItem(attemptKey, '1');
    }

    // Correct Answer
    if (input === combo[currentIndex]) {
      let newHints = [...hints];
      newHints[currentIndex] = combo[currentIndex].length;
      setHints(newHints);
      setInput('');
      setCurrentIndex(currentIndex + 1);
      setGuesses(guesses + 1);

      // Game Over Logic
      if (currentIndex == combo.length - 1) {
        setCurrentIndex(1000);
        setGameOver(true);
        setGameOverMenu(true);

        const inputEl = document.activeElement;
        if (inputEl && inputEl.blur) inputEl.blur();

        const stats = JSON.parse(localStorage.getItem('wordcombo-stats') || '{}');
        stats[todayKey] = {
          guesses: guesses + 1,
          completed: true,
        };
        localStorage.setItem('wordcombo-stats', JSON.stringify(stats));

        logEvent('complete', { guesses: guesses + 1, success: true });
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

  useEffect(() => {
    if (gameOver) {
      const updated = calculateStreak();
      setStreak(updated);
  }
  }, [gameOver]);

  const handleShare = () => {
    const text = `I finished today's WordCombo in ${guesses} guess${guesses !== 1 ? 'es' : ''}! 🧩 🎉\nGive it a try at https://wordcombo.app`;
    
    navigator.clipboard.writeText(text).then(() => {
      logEvent('share');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return <div className="text-slate-100 text-center mt-10">Loading today's combo...</div>;
  }

  return (
    <div className='app-container flex flex-col items-center justify-center text-slate-100'>
      <HowToPlayModal isOpen={showModal} onClose={() => setShowModal(false)}/>

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
          {shownCombo.slice(0, currentIndex + 1).map((word, index) => (
            <div
              key={index}
              className={`word-container flex items-center justify-center rounded-xl px-10 py-0.5 m-3 transition-all duration-300 shadow-lg/25
                ${
                  gameOver
                    ? 'bg-slate-800'
                    : index === currentIndex
                    ? `scale-110 bg-slate-800 ${evaluation}`
                    : index === currentIndex - 1
                    ? 'scale-105 bg-slate-700'
                    : 'bg-slate-400'
                }
              `}
            >
              <div className='bg-transparent my-2'>
                <h2 className='text-3xl tracking-widest font-semibold'>{word}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* Remaining Words */}
        <div className='remaining-words-container flex items-center text-center justify-center mt-2'>
          <h1>
            {(currentIndex < 100) ? (
              `Question ${currentIndex} of ${combo.length - 1}`
            ) : (
              `You made it to the end!`
            )
            }
          </h1>
        </div>

        {/* Input Field */}
        <div className='input-container flex flex-col items-center justify-center mt-4 w-3/5 max-w-md'>
          <input
            disabled={gameOver}
            className={`
              border-2 rounded-lg p-2 text-center text-2xl w-full
              ${gameOver
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                : 'bg-white text-slate-700 border-gray-300'}
            `}
            type="text"
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
        <div className='bottom-right-container fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2'>
          <div className='help-button-container'>
            <button
              onClick={() => {
                setShowModal(true);
                setGameOverMenu(false);
              }}
              className='w-12 sm:w-55 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-xl font-semibold px-4 py-2 rounded-xl shadow-lg transition-all'
            >
              ❓<span className="hidden sm:inline"> How to Play</span>
            </button>
          </div>
          {gameOver && (
            <div className='menu-button-container'>
              <button
                onClick={() => {
                  setGameOverMenu(true);
                  setShowModal(false);
                }}
                className='w-12 sm:w-55 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-xl font-semibold px-4 py-2 rounded-xl shadow-lg transition-all'
              >
                📝<span className="hidden sm:inline"> View Results</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {gameOverMenu && (
        <div className="absolute flex flex-col items-center justify-center bg-slate-900 text-white p-10 md:p-16 rounded-4xl shadow-lg/25">
          <h1 className="text-2xl md:text-4xl font-bold text-green-400 mb-4">🎉 Congratulations! 🎉</h1>
          <p className="text-lg md:text-xl mb-6 text-center">You completed the word combo!</p>

    {/* Combined stats card */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800 p-6 rounded-2xl shadow-lg mb-6 w-full max-w-md">
      {/* Guesses */}
      <div className="flex flex-col items-center">
        <span className="uppercase text-sm text-slate-400 mb-1">Guesses</span>
        <span className="text-3xl font-bold text-yellow-300">{guesses}</span>
      </div>
      {/* Streak */}
      <div className="flex flex-col items-center">
        <span className="uppercase text-sm text-slate-400 mb-1">Streak</span>
        <span className="text-3xl font-bold text-green-400">
          {streak} day{streak !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
      <p className="text-md text-slate-400 mb-6">Come back tomorrow for a new challenge 🔥</p>
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

      {/* Footer */}
      <footer className="text-base text-slate-500 text-center mt-12 mb-6 pt-6 border-t border-slate-700">
        <p>Made with ❤️ by Chinh Nguyen</p>
        <div className="flex justify-center gap-6 mt-1 text-sm">
          <button onClick={() => setShowAbout(true)} className="hover:text-white">About</button>
          <button onClick={() => setShowPrivacy(true)} className="hover:text-white">Privacy</button>
          <a
            href="https://github.com/NguyenHChinh/wordcombo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          
          <AboutModal show={showAbout} onClose={() => setShowAbout(false)} />
          <PrivacyModal show={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </div>
      </footer>

    </div>
  )
}

export default App
