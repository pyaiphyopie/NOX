import useFilteredEvents from '../hooks/useFilteredEvents';
import CategoryFilter from '../components/CategoryFilter';
import EventCard from '../components/EventCard';
import StatGrid from '../components/StatGrid';

export default function DiscoverPage() {
  const { activeTag, setActiveTag, filteredEvents, categories } = useFilteredEvents();

  return (
    <>
      <section className="relative z-10 px-8 py-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6 text-sm text-cyan-300">
            Yangon Beta Launch • ASEAN Expansion Ready
          </div>
          <h2 className="text-6xl md:text-7xl font-black leading-none tracking-tight">
            Urban
            <br />
            Nightlife
            <br />
            Infrastructure
          </h2>
          <p className="mt-8 text-lg text-white/70 leading-relaxed max-w-xl">
            Discover events, secure digital tickets, manage nightlife operations, and power the next
            generation of entertainment ecosystems across emerging ASEAN cities.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button className="bg-cyan-500 text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition">
              Explore Events
            </button>
            <span className="border border-white/20 px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition cursor-pointer text-white">
              View Demo
            </span>
          </div>
          <StatGrid
            items={[
              ['300+', 'Events Planned'],
              ['50+', 'Promoters'],
              ['20+', 'Venues'],
            ]}
            className="mt-12 grid grid-cols-3 gap-6 max-w-lg"
          />
        </div>

        <div className="relative flex justify-center">
          <div className="absolute w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />
          <div className="relative w-[340px] h-[720px] rounded-[40px] border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl shadow-cyan-500/20">
            <div className="h-10 flex items-center justify-center text-xs text-white/40 border-b border-white/5">
              NOX • Tonight&apos;s Pulse
            </div>
            <div className="p-4 space-y-4 overflow-y-auto h-full pb-24">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-black/70 font-bold">
                  Trending
                </p>
                <h3 className="text-2xl font-black mt-3 text-black">AFTER DARK</h3>
                <p className="text-black/70 mt-2 text-sm">
                  The city&apos;s underground pulse starts here.
                </p>
              </div>
              <CategoryFilter
                categories={categories}
                activeTag={activeTag}
                onTagChange={setActiveTag}
              />
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 backdrop-blur-xl flex justify-around py-4 text-xs text-white/60">
              {['Discover', 'Tickets', 'Create', 'Profile'].map((tab) => (
                <button
                  key={tab}
                  className={tab === 'Discover' ? 'text-cyan-400' : 'hover:text-cyan-300'}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-16 border-t border-white/10">
        <StatGrid
          items={[
            ['15K+', 'Monthly Users'],
            ['500+', 'Events Hosted'],
            ['98%', 'QR Success'],
            ['4.8\u2605', 'Avg Rating'],
          ]}
          className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        />
      </section>
    </>
  );
}
