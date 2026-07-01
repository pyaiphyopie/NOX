export default function ButtonPair({ primaryLabel, secondaryLabel, onPrimary, onSecondary }) {
  return (
    <div className="flex gap-3">
      <button
        className="flex-1 bg-cyan-500 text-black py-3 rounded-xl font-bold hover:bg-cyan-400 transition"
        onClick={onPrimary}
      >
        {primaryLabel}
      </button>
      <button
        className="flex-1 border border-white/20 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
        onClick={onSecondary}
      >
        {secondaryLabel}
      </button>
    </div>
  );
}
