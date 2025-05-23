import { useState, useEffect } from 'react';

function HowToPlayModal({ isOpen, onClose }) {
  // Close the modal when the user presses the Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [onClose]);

  // Checks if the modal is open
  // If not, return null to avoid rendering
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-2xl max-w-md w-full shadow-xl">
        {/* Title */}
        <h2 className="text-2xl font-bold mb-4">🧩 How to Play WordCombo</h2>

        {/* Instructions */}
        <p className="mb-2">Create a chain of compound words.</p>
        <p className="mb-2">Start with a base word and guess the next word to form a compound:</p>

        {/* Example */}
        <div className="bg-gray-100 rounded p-3 text-sm my-3">
          <p><strong>START:</strong> SNOW</p>
          <p><strong>Guess:</strong> BALL  <span className="text-green-600 font-semibold">(SNOWBALL)</span></p>
          <p><strong>Then:</strong> GAME <span className="text-green-600 font-semibold">(BALL GAME)</span></p>
          <br/>
          <p>and so on.</p>
        </div>

        {/* Goal and Hint */}
        <p className="mb-4">The goal is to complete the chain with as few guesses as possible!</p>
        <p className="text-sm text-gray-600 mb-4">Each incorrect guess reveals a letter.</p>

        {/* Play button */}
        <button
          onClick={onClose}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl"
        >
          Play
        </button>
      </div>
    </div>
  );
}

export default HowToPlayModal;