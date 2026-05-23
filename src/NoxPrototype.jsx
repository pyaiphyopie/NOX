import { useMemo, useState } from 'react';

const events = [
  {
    title: 'NEON DISTRICT',
    venue: 'Warehouse 19',
    genre: 'Techno / Underground',
    category: 'Techno',
    time: 'Tonight • 11:00 PM',
    price: '$12',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'AFTERHOURS',
    venue: 'NOIR Rooftop',
    genre: 'Hip-Hop / Trap',
    category: 'Hip-Hop',
    time: 'Friday • 10:30 PM',
    price: '$18',
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'SKYLINE SIGNAL',
    venue: 'Atlas Terrace',
    genre: 'Rooftop / House',
    category: 'Rooftop',
    time: 'Saturday • 9:30 PM',
    price: '$20',
    image:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'AMPLIFIED CITY',
    venue: 'The Foundry',
    genre: 'Live Bands / Indie',
    category: 'Live Bands',
    time: 'Sunday • 8:00 PM',
    price: '$10',
    image:
      'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'ELECTRIC MONSOON',
    venue: 'Pulse Arena',
    genre: 'EDM / Festival',
    category: 'EDM',
    time: 'Next Friday • 10:00 PM',
    price: '$25',
    image:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop',
  },
];

const tags = ['All', 'Techno', 'Hip-Hop', 'EDM', 'Live Bands', 'Rooftop'];

const phoneTabs = {
  Discover: {
    label: 'Tonight\'s Pulse',
    title: 'AFTER DARK',
    body: "The city's underground pulse starts here.",
  },
  Tickets: {
    label: 'Digital Entry',
    title: 'QR READY',
    body: 'Select an event to stage a ticket and entry pass.',
  },
  Create: {
    label: 'Promoter OS',
    title: 'CREATE NIGHT',
    body: 'Draft events, track capacity, and preview door operations.',
  },
  Profile: {
    label: 'Member Profile',
    title: 'NIGHT ID',
    body: 'Saved venues, favorite genres, and beta access live here.',
  },
};

export default function NoxPrototype() {
  const [activeTag, setActiveTag] = useState('All');
  const [activeTab, setActiveTab] = useState('Discover');
  const [selectedEvent, setSelectedEvent] = useState(events[0]);
  const [notice, setNotice] = useState(null);

  const filteredEvents = useMemo(() => {
    if (activeTag === 'All') {
      return events;
    }

    return events.filter((event) => event.category === activeTag);
  }, [activeTag]);

  function scrollToId(id) {
    const target = document.getElementById(id);

    if (typeof target?.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function showNotice(title, body) {
    setNotice({ title, body });
  }

  function openTickets(event = selectedEvent) {
    setSelectedEvent(event);
    setActiveTab('Tickets');
    scrollToId('phone-preview');
    showNotice('Ticket staged', `${event.title} is ready in the phone preview.`);
  }

  function switchPhoneTab(tab) {
    setActiveTab(tab);
    scrollToId('phone-preview');
  }

  const phoneCopy = phoneTabs[activeTab];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-purple-500/10 to-black" />

        <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-black tracking-[0.3em]">NOX</h1>
            <p className="text-xs text-white/50 tracking-[0.2em] uppercase">
              Own The Night
            </p>
          </div>

          <div className="hidden md:flex gap-8 text-sm text-white/70">
            <button className="hover:text-cyan-400 transition" onClick={() => scrollToId('discover')}>
              Discover
            </button>
            <button className="hover:text-cyan-400 transition" onClick={() => scrollToId('venues')}>
              Venues
            </button>
            <button className="hover:text-cyan-400 transition" onClick={() => scrollToId('operators')}>
              Promoters
            </button>
            <button className="hover:text-cyan-400 transition" onClick={() => switchPhoneTab('Tickets')}>
              Tickets
            </button>
          </div>

          <button
            className="bg-cyan-500 hover:bg-cyan-400 transition px-5 py-2 rounded-full text-black font-semibold"
            onClick={() =>
              showNotice('Beta access unlocked', 'NOX mobile app access is queued for the Yangon launch list.')
            }
          >
            Get App
          </button>
        </nav>

        {notice && (
          <div className="fixed right-6 top-24 z-50 w-[min(360px,calc(100vw-48px))] rounded-2xl border border-cyan-400/40 bg-black/90 p-5 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Action Complete</p>
                <h2 className="mt-2 text-xl font-black">{notice.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{notice.body}</p>
              </div>
              <button
                aria-label="Close notification"
                className="h-8 w-8 shrink-0 rounded-full border border-white/15 text-white/70 hover:border-cyan-400 hover:text-cyan-300"
                onClick={() => setNotice(null)}
              >
                x
              </button>
            </div>
          </div>
        )}

        <section
          id="discover"
          className="relative z-10 px-8 py-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center"
        >
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
              Discover events, secure digital tickets, manage nightlife operations, and power the next generation of entertainment ecosystems across emerging ASEAN cities.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                className="bg-cyan-500 text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition"
                onClick={() => switchPhoneTab('Discover')}
              >
                Explore Events
              </button>

              <button
                className="border border-white/20 px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition"
                onClick={() => {
                  setActiveTab('Create');
                  scrollToId('operators');
                  showNotice('Demo mode active', 'The promoter workflow is highlighted below.');
                }}
              >
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

          <div id="phone-preview" className="relative flex justify-center">
            <div className="absolute w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />

            <div className="relative w-[340px] h-[720px] rounded-[40px] border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl shadow-cyan-500/20">
              <div className="h-10 flex items-center justify-center text-xs text-white/40 border-b border-white/5">
                NOX • {phoneCopy.label}
              </div>

              <div className="p-4 space-y-4 overflow-y-auto h-full pb-24">
                <div className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/70 font-bold">
                    {activeTab}
                  </p>

                  <h3 className="text-2xl font-black mt-3 text-black">{phoneCopy.title}</h3>

                  <p className="text-black/70 mt-2 text-sm">{phoneCopy.body}</p>
                </div>

                {activeTab === 'Discover' && (
                  <>
                    <div className="flex gap-2 overflow-x-auto pb-2 text-sm">
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          className={`px-4 py-2 rounded-full border whitespace-nowrap transition ${
                            activeTag === tag
                              ? 'bg-cyan-500 text-black border-cyan-400'
                              : 'bg-white/5 border-white/10 hover:bg-cyan-500/20'
                          }`}
                          onClick={() => setActiveTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    {filteredEvents.map((event) => (
                      <button
                        key={event.title}
                        className="block w-full text-left bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:scale-[1.02] transition"
                        onClick={() => openTickets(event)}
                      >
                        <img src={event.image} alt={event.title} className="h-44 w-full object-cover" />

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
                            <span className="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold">
                              Secure Entry
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {activeTab === 'Tickets' && (
                  <div className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Selected Ticket</p>
                    <h4 className="mt-3 text-2xl font-black">{selectedEvent.title}</h4>
                    <p className="mt-1 text-sm text-white/60">{selectedEvent.venue}</p>
                    <div className="my-6 grid h-36 place-items-center rounded-2xl bg-white text-black">
                      <div className="grid grid-cols-5 gap-1">
                        {Array.from({ length: 25 }).map((_, index) => (
                          <span
                            key={index}
                            className={`h-4 w-4 ${index % 3 === 0 || index % 7 === 0 ? 'bg-black' : 'bg-white'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">{selectedEvent.time}</span>
                      <span className="font-black text-cyan-300">{selectedEvent.price}</span>
                    </div>
                  </div>
                )}

                {activeTab === 'Create' && (
                  <div className="space-y-3">
                    {['Draft event', 'Set capacity', 'Publish tickets', 'Scan entry'].map((step, index) => (
                      <button
                        key={step}
                        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left hover:border-cyan-400/50"
                        onClick={() => showNotice('Workflow step selected', step)}
                      >
                        <span className="font-semibold">{step}</span>
                        <span className="text-cyan-300">0{index + 1}</span>
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === 'Profile' && (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-white/60">Member tier</p>
                    <h4 className="mt-2 text-3xl font-black text-cyan-300">Beta Insider</h4>
                    <div className="mt-6 space-y-3 text-sm text-white/70">
                      <p>Saved venues: 8</p>
                      <p>Favorite genre: Techno</p>
                      <p>Ticket credits: $30</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 backdrop-blur-xl flex justify-around py-4 text-xs text-white/60">
                {Object.keys(phoneTabs).map((tab) => (
                  <button
                    key={tab}
                    className={activeTab === tab ? 'text-cyan-400' : 'hover:text-cyan-300'}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="venues" className="px-8 py-24 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="uppercase text-cyan-400 tracking-[0.3em] text-sm mb-4">Platform Features</p>

            <h2 className="text-5xl font-black max-w-2xl leading-tight">
              Built for nightlife operators, creators, and urban audiences.
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
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
          ].map((item) => (
            <button
              key={item.title}
              className="text-left bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-cyan-400/40 transition"
              onClick={() => showNotice(item.title, item.desc)}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 mb-6" />

              <h3 className="text-2xl font-black mb-4">{item.title}</h3>

              <p className="text-white/60 leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section id="operators" className="px-8 py-24 border-t border-white/10 bg-gradient-to-b from-black to-[#0A0F1F]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="uppercase text-cyan-400 tracking-[0.3em] text-sm mb-4">Organizer Dashboard</p>

            <h2 className="text-5xl font-black leading-tight">
              Infrastructure for promoters and venues.
            </h2>

            <div className="mt-10 space-y-6">
              {[
                'Create and manage events in minutes',
                'Track live ticket sales and attendance',
                'Export guestlists and scan QR tickets',
                'Monitor analytics and customer behavior',
              ].map((feature) => (
                <button
                  key={feature}
                  className="flex w-full items-start gap-4 text-left hover:text-cyan-300"
                  onClick={() => showNotice('Organizer action', feature)}
                >
                  <div className="w-3 h-3 rounded-full bg-cyan-400 mt-2" />
                  <p className="text-lg text-white/70">{feature}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
