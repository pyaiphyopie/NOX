import { VENUES } from '../data/events';

export default function VenuesPage() {
  return (
    <section className="px-8 py-24 max-w-7xl mx-auto">
      <div className="mb-16">
        <p className="uppercase text-cyan-400 tracking-[0.3em] text-sm mb-4">Venue Network</p>
        <h2 className="text-5xl font-black leading-tight max-w-2xl">
          Partner venues powering the nightlife infrastructure.
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {VENUES.map((venue) => (
          <div
            key={venue.name}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-cyan-400/40 transition"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-black">{venue.name}</h3>
              <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
                ★ {venue.rating}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Type</span>
                <span className="text-white">{venue.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Capacity</span>
                <span className="text-white">{venue.capacity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Location</span>
                <span className="text-white">{venue.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
