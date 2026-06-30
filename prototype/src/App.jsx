const events = [
  {
    title: 'NEON DISTRICT',
    venue: 'Warehouse 19',
    genre: 'Techno / Underground',
    time: 'Tonight • 11:00 PM',
    price: '$12',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'AFTERHOURS',
    venue: 'NOIR Rooftop',
    genre: 'Hip-Hop / Trap',
    time: 'Friday • 10:30 PM',
    price: '$18',
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop',
  },
];

const tags = ['Techno', 'Hip-Hop', 'EDM', 'Live Bands', 'Rooftop'];

const features = [
  {
    title: 'Event Discovery',
    desc: 'Real-time nightlife discovery optimized for mobile-first urban culture.',
  },
  {
    title: 'QR Ticketing',
    desc: 'Fraud-resistant digital entry infrastructure with instant validation.',
  },
  {
    title: 'Promoter OS',
    desc: 'Operational dashboards, analytics, attendance tracking, and guestlists.',
  },
  {
    title: 'Venue Intelligence',
    desc: 'Customer trends, forecasting, and nightlife behavioral insights.',
  },
];

const dashboardStats = [
  ['Tickets Sold', '1,248'],
  ['Revenue', '$18,900'],
  ['Attendance', '92%'],
  ['Check-ins', '1,034'],
];

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-purple-500/10 to-black" />

        <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-black tracking-[0.3em]">NOX</h1>
            <p className="text-xs text-white/50 tracking-[0.2em] uppercase">Own The Night</p>
          </div>

          <div className="hidden md:flex gap-8 text-sm text-white/70">
            <button className="hover:text-cyan-400 transition">Discover</button>
            <button className="hover:text-cyan-400 transition">Venues</button>
            <button className="hover:text-cyan-400 transition">Promoters</button>
            <button className="hover:text-cyan-400 transition">Tickets</button>
          </div>

          <button className="bg-cyan-500 hover:bg-cyan-400 transition px-5 py-2 rounded-full text-black font-semibold">
            Get App
          </button>
        </nav>

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
              Discover events, secure digital tickets, manage nightlife operations,
              and power the next generation of entertainment ecosystems across
              emerging ASEAN cities.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="bg-cyan-500 text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition">
                Explore Events
              </button>

              <button className="border border-white/20 px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition">
                View Demo
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <h3 className="text-3xl font-black text-cyan-400">300+</h3>
                <p className="text-sm text-white/60 mt-1">Events Planned</p>
              </div>

              <div>
                <h3 className="text-3xl font-black text-cyan-400">50+</h3>
                <p className="text-sm text-white/60 mt-1">Promoters</p>
              </div>

              <div>
                <h3 className="text-3xl font-black text-cyan-400">20+</h3>
                <p className="text-sm text-white/60 mt-1">Venues</p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />

            <div className="relative w-[340px] h-[720px] rounded-[40px] border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl shadow-cyan-500/20">
              <div className="h-10 flex items-center justify-center text-xs text-white/40 border-b border-white/5">
                NOX • Tonight's Pulse
              </div>

              <div className="p-4 space-y-4 overflow-y-auto h-full pb-24">
                <div className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/70 font-bold">
                    Trending Tonight
                  </p>

                  <h3 className="text-2xl font-black mt-3 text-black">AFTER DARK</h3>

                  <p className="text-black/70 mt-2 text-sm">
                    The city's underground pulse starts here.
                  </p>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 text-sm">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      className="px-4 py-2 rounded-full bg-white/5 border border-white/10 whitespace-nowrap hover:bg-cyan-500/20"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {events.map((event) => (
                  <div
                    key={event.title}
                    className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:scale-[1.02] transition cursor-pointer"
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-44 w-full object-cover"
                    />

                    <div className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-xl font-black">{event.title}</h4>
                          <p className="text-cyan-400 text-sm mt-1">{event.venue}</p>
                        </div>

                        <div className="bg-cyan-500 text-black text-sm font-black px-3 py-1 rounded-full">
                          {event.price}
                        </div>
                      </div>

                      <p className="text-white/60 text-sm mt-3">{event.genre}</p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-white/50 text-sm">{event.time}</span>

                        <button className="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-cyan-400 transition">
                          Secure Entry
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 backdrop-blur-xl flex justify-around py-4 text-xs text-white/60">
                <button className="text-cyan-400">Discover</button>
                <button>Tickets</button>
                <button>Create</button>
                <button>Profile</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="px-8 py-24 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="uppercase text-cyan-400 tracking-[0.3em] text-sm mb-4">Platform Features</p>

            <h2 className="text-5xl font-black max-w-2xl leading-tight">
              Built for nightlife operators, creators, and urban audiences.
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item) => (
            <div key={item.title} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-cyan-400/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 mb-6" />

              <h3 className="text-2xl font-black mb-4">{item.title}</h3>
              <p className="text-white/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-8 py-24 border-t border-white/10 bg-gradient-to-b from-black to-[#0A0F1F]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="uppercase text-cyan-400 tracking-[0.3em] text-sm mb-4">Organizer Dashboard</p>

            <h2 className="text-5xl font-black leading-tight">Infrastructure for promoters and venues.</h2>

            <div className="mt-10 space-y-6">
              {[
                'Create and manage events in minutes',
                'Track live ticket sales and attendance',
                'Export guestlists and scan QR tickets',
                'Monitor analytics and customer behavior',
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 mt-2" />
                  <p className="text-lg text-white/70">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black">Promoter Console</h3>
                <p className="text-white/50 text-sm mt-1">Live Event Analytics</p>
              </div>

              <div className="bg-emerald-400/20 text-emerald-300 px-4 py-2 rounded-full text-sm">Live</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {dashboardStats.map(([label, value]) => (
                <div key={label} className="bg-black/40 rounded-2xl p-5 border border-white/5">
                  <p className="text-white/50 text-sm">{label}</p>
                  <h4 className="text-3xl font-black mt-2">{value}</h4>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl p-6 border border-cyan-500/20">
              <p className="text-cyan-300 text-sm uppercase tracking-[0.2em]">Predictive Insight</p>
              <h4 className="text-2xl font-black mt-3">Attendance demand trending +24% this weekend.</h4>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-8 py-12 border-t border-white/10 text-center text-white/40">
        <h2 className="text-3xl font-black tracking-[0.3em] text-white mb-4">NOX</h2>
        <p>Urban Entertainment Infrastructure Platform</p>
      </footer>
    </div>
  );
}
