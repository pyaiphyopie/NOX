export default function CategoryFilter({ categories, activeTag, onTagChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 text-sm">
      {categories.map((tag) => (
        <button
          key={tag}
          className={`px-4 py-2 rounded-full border whitespace-nowrap transition ${
            activeTag === tag
              ? 'bg-cyan-500 text-black border-cyan-400'
              : 'bg-white/5 border-white/10 hover:bg-cyan-500/20'
          }`}
          onClick={() => onTagChange(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
