import { VENUES } from '../data/events';
import GlassCard from '../components/GlassCard';

export default function ProfilePage() {
  return (
    <section className="px-8 py-24 max-w-4xl mx-auto">
      {/* -- Profile Header -- */}
      <GlassCard className="mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-3xl font-black">
            N
          </div>
          <div>
            <h2 className="text-3xl font-black">Nightlife Explorer</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
                Beta Insider
              </span>
              <span className="text-white/50 text-sm">Yangon, Myanmar</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            ['Saved Venues', '8'],
            ['Favorite Genre', 'Techno'],
            ['Ticket Credits', '$30'],
            ['Events Attended', '12'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="bg-black/40 rounded-2xl p-4 border border-white/5 text-center"
            >
              <p className="text-white/50 text-xs mb-1">{label}</p>
              <p className="text-xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* -- Preferences -- */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-black mb-4">Music Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {['Techno', 'EDM', 'Hip-Hop', 'Live Bands', 'House', 'Underground'].map((genre) => (
              <span
                key={genre}
                className={`px-4 py-2 rounded-full text-sm border ${
                  ['Techno', 'EDM', 'Hip-Hop'].includes(genre)
                    ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-black mb-4">Saved Venues</h3>
          <div className="space-y-3">
            {VENUES.slice(0, 4).map((venue) => (
              <div
                key={venue.name}
                className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5"
              >
                <div>
                  <p className="font-semibold text-white">{venue.name}</p>
                  <p className="text-white/50 text-xs">{venue.location}</p>
                </div>
                <span className="text-cyan-300 text-sm">★ {venue.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
