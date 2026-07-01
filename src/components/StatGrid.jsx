export default function StatGrid({ items, className = '' }) {
  return (
    <div className={className}>
      {items.map(([value, label]) => (
        <div key={label}>
          <h3 className="text-3xl font-black text-cyan-400">{value}</h3>
          <p className="text-sm text-white/60 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
