import { PLATFORM_FEATURES } from '../data/events';

export default function FeatureGrid({ onFeatureClick }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {PLATFORM_FEATURES.map((item) => {
        const Tag = onFeatureClick ? 'button' : 'div';
        return (
          <Tag
            key={item.title}
            className="text-left bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-cyan-400/40 transition"
            onClick={onFeatureClick ? () => onFeatureClick(item) : undefined}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 mb-6" />
            <h3 className="text-2xl font-black mb-4">{item.title}</h3>
            <p className="text-white/60 leading-relaxed">{item.desc}</p>
          </Tag>
        );
      })}
    </div>
  );
}
