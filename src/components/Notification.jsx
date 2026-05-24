export default function Notification({ notice, onClose }) {
  if (!notice) return null;

  return (
    <div className="fixed right-6 top-24 z-50 w-[min(360px,calc(100vw-48px))] rounded-2xl border border-cyan-400/40 bg-black/90 p-5 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl animate-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Action Complete</p>
          <h2 className="mt-2 text-xl font-black">{notice.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{notice.body}</p>
        </div>
        <button
          aria-label="Close notification"
          className="h-8 w-8 shrink-0 rounded-full border border-white/15 text-white/70 hover:border-cyan-400 hover:text-cyan-300"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
