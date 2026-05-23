import { useParams, Link } from 'react-router-dom';
import { EVENTS } from '../data/events';

export default function EventDetailPage() {
  const { id } = useParams();
  const event = EVENTS.find((e) => e.id === id);

  if (!event) {
    return (
      <section className="px-8 py-24 max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-black">Event Not Found</h2>
        <Link to="/" className="text-cyan-400 mt-6 inline-block hover:underline">
          ← Back to Discover
        </Link>
      </section>
    );
  }

  const soldPercent = Math.round((event.attendance / event.capacity) * 100);

  return (
    <section className="px-8 py-24 max-w-7xl mx-auto">
      <Link to="/" className="text-cyan-400 text-sm mb-8 inline-block hover:underline">
        ← Back to Discover
      </Link>

      <div className="grid lg:grid-cols-3 gap-12 mt-6">
        {/* ── Image ──────────────────────────── */}
        <div className="lg:col-span-2">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-[400px] object-cover rounded-[32px]"
          />
        </div>

        {/* ── Info ───────────────────────────── */}
        <div className="space-y-6">
          <div>
            <div className="inline-flex gap-2 mb-4">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-4xl font-black">{event.title}</h2>
            <p className="text-cyan-400 text-lg mt-2">{event.venue}</p>
          </div>

          <p className="text-white/60 leading-relaxed">{event.description}</p>

          {/* Capacity bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/50">Capacity</span>
              <span className="text-white">
                {event.attendance.toLocaleString()} / {event.capacity.toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
          </div>

          {/* Lineup */}
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] text-white/50 mb-3">Lineup</h4>
            <div className="space-y-2">
              {event.lineup.map((artist) => (
                <div
                  key={artist}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">
                    ♫
                  </div>
                  <span className="text-white font-medium">{artist}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/50 text-sm">{event.time}</p>
                <p className="text-3xl font-black text-cyan-300">${event.price}</p>
              </div>
              <div className="text-sm text-white/50">{soldPercent}% sold</div>
            </div>
            <button className="w-full bg-cyan-500 text-black py-4 rounded-2xl font-bold text-lg hover:bg-cyan-400 transition">
              Purchase Ticket
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
