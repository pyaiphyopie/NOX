import { DASHBOARD_METRICS, PROMOTER_WORKFLOW } from '../data/events';

export default function PromotersPage() {
  return (
    <>
      {/* ── Promoter Console ─────────────────── */}
      <section className="px-8 py-24 border-b border-white/10 bg-gradient-to-b from-black to-[#0A0F1F]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="uppercase text-cyan-400 tracking-[0.3em] text-sm mb-4">
              Organizer Dashboard
            </p>
            <h2 className="text-5xl font-black leading-tight">
              Infrastructure for promoters and venues.
            </h2>
            <div className="mt-10 space-y-4">
              {PROMOTER_WORKFLOW.map(({ step, description }) => (
                <div
                  key={step}
                  className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                    {PROMOTER_WORKFLOW.indexOf({ step, description }) + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{step}</h4>
                    <p className="text-white/50 text-sm mt-1">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Live Dashboard Card ──────────── */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black">Promoter Console</h3>
                <p className="text-white/50 text-sm mt-1">Live Event Analytics</p>
              </div>
              <div className="bg-emerald-400/20 text-emerald-300 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                ['Tickets Sold', DASHBOARD_METRICS.ticketsSold.toLocaleString()],
                ['Revenue', `$${DASHBOARD_METRICS.revenue.toLocaleString()}`],
                ['Attendance', `${DASHBOARD_METRICS.attendanceRate}%`],
                ['Check-ins', DASHBOARD_METRICS.checkIns.toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="bg-black/40 rounded-2xl p-5 border border-white/5">
                  <p className="text-white/50 text-sm">{label}</p>
                  <h4 className="text-3xl font-black mt-2">{value}</h4>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl p-6 border border-cyan-500/20">
              <p className="text-cyan-300 text-sm uppercase tracking-[0.2em]">Predictive Insight</p>
              <h4 className="text-2xl font-black mt-3">
                Attendance demand trending +24% this weekend.
              </h4>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-cyan-500 text-black py-3 rounded-xl font-bold hover:bg-cyan-400 transition">
                Create Event
              </button>
              <button className="flex-1 border border-white/20 py-3 rounded-xl font-semibold hover:bg-white/10 transition">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────── */}
      <section className="px-8 py-24 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="uppercase text-cyan-400 tracking-[0.3em] text-sm mb-4">
              Platform Features
            </p>
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
            <div
              key={item.title}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-cyan-400/40 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 mb-6" />
              <h3 className="text-2xl font-black mb-4">{item.title}</h3>
              <p className="text-white/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
