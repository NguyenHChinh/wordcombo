
function AboutModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 text-white p-6 rounded-2xl w-full max-w-md shadow-lg relative">
        <h2 className="text-2xl font-bold mb-4">About WordCombo</h2>
        <p className="mb-4">
          <strong>WordCombo</strong> is a daily word game where you guess connected word pairs. Miss a guess, and you'll get a hint,  one letter at a time.
        </p>
        <p className="mb-4">
          Designed and developed by <strong>Chinh Nguyen</strong>
        </p>
        <div className='mt-5 border-t border-slate-600 pt-4'>
            <p className="text-sm text-slate-400 mb-4">
                View this project on <a href="https://github.com/nguyenhchinh/wordcombo" className="underline">GitHub</a>, or check out more of my work on my <a href="https://github.com/nguyenhchinh" className="underline">profile</a>.
            </p>
            <p className="">
                🔗 <a href="https://chinhnguyen.dev" target="_blank" rel="noopener noreferrer" className="underline">My Portfolio</a>
            </p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white hover:text-slate-300 text-2xl"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

export default AboutModal;