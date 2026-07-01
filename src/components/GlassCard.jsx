export default function GlassCard({ children, className = '' }) {
  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
