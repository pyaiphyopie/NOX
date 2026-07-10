export default function QrPlaceholder({ cells = 64, columns = 8 }) {
  return (
    <div className="bg-white rounded-3xl p-8 flex items-center justify-center">
      <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: cells }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 ${(i * 7 + i * 3) % 11 < 5 ? 'bg-black' : 'bg-white'}`}
          />
        ))}
      </div>
    </div>
  );
}
