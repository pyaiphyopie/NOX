export default function SectionHeader({ label, heading, className = '' }) {
  return (
    <div className={className}>
      <p className="uppercase text-cyan-400 tracking-[0.3em] text-sm mb-4">{label}</p>
      <h2 className="text-5xl font-black leading-tight max-w-2xl">{heading}</h2>
    </div>
  );
}
