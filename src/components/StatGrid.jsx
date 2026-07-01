export default function StatGrid({
  items,
  className = '',
  valueClassName = 'text-3xl font-black text-cyan-400',
  labelClassName = 'text-sm text-white/60 mt-1',
}) {
  return (
    <div className={className}>
      {items.map(([value, label]) => (
        <div key={label}>
          <h3 className={valueClassName}>{value}</h3>
          <p className={labelClassName}>{label}</p>
        </div>
      ))}
    </div>
  );
}
