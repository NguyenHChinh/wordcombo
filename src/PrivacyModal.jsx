
function PrivacyModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 text-white p-6 rounded-2xl w-full max-w-md shadow-lg relative">
        <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
        <p className="mb-3">
          WordCombo doesn't collect personal data. Your progress is saved in your browser.
        </p>
        <p className="mb-3">
          Game progress is stored locally in your browser. We use anonymous Supabase analytics to track visits and puzzle completions only.
        </p>
        <p className="text-sm text-slate-400">
          Questions? <a href="mailto:contact@chinhnguyen.dev" className="underline">Email me</a>
        </p>
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

export default PrivacyModal;