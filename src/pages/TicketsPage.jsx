import { useState } from 'react';
import { EVENTS } from '../data/events';

export default function TicketsPage() {
  const [selectedEvent, setSelectedEvent] = useState(EVENTS[0]);

  return (
    <section className="px-8 py-24 max-w-7xl mx-auto">
      <div className="mb-16">
        <p className="uppercase text-cyan-400 tracking-[0.3em] text-sm mb-4">Digital Entry</p>
        <h2 className="text-5xl font-black leading-tight max-w-2xl">
          QR-powered tickets. Fraud-resistant. Instant validation.
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* ── Event Selector ─────────────────── */}
        <div>
          <h3 className="text-xl font-semibold mb-6 text-white/70">
            Select an event to preview your ticket
          </h3>
          <div className="space-y-3">
            {EVENTS.map((event) => (
              <button
                key={event.id}
                className={`w-full text-left p-5 rounded-2xl border transition ${
                  selectedEvent.id === event.id
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-white/10 bg-white/5 hover:border-cyan-400/30'
                }`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg">{event.title}</h4>
                    <p className="text-cyan-400 text-sm mt-1">{event.venue}</p>
                  </div>
                  <span className="text-cyan-300 font-black">${event.price}</span>
                </div>
                <p className="text-white/50 text-sm mt-2">{event.time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Ticket Preview ─────────────────── */}
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black">Digital Ticket</h3>
              <p className="text-white/50 text-sm mt-1">QR Entry Pass</p>
            </div>
            <div className="bg-emerald-400/20 text-emerald-300 px-4 py-2 rounded-full text-sm">
              Valid
            </div>
          </div>

          <div className="bg-black/40 rounded-3xl p-6 border border-white/5 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-2xl font-black">{selectedEvent.title}</h4>
                <p className="text-cyan-400 mt-1">{selectedEvent.venue}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-cyan-300">${selectedEvent.price}</p>
                <p className="text-white/50 text-xs mt-1">General Admission</p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Date</span>
                <span className="text-white">{selectedEvent.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Genre</span>
                <span className="text-white">{selectedEvent.genre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Ticket ID</span>
                <span className="text-white font-mono text-xs">
                  NOX-{selectedEvent.id.padStart(6, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-3xl p-8 flex items-center justify-center">
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: 64 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-4 w-4 ${(i * 7 + i * 3) % 11 < 5 ? 'bg-black' : 'bg-white'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button className="flex-1 bg-cyan-500 text-black py-3 rounded-xl font-bold hover:bg-cyan-400 transition">
              Add to Wallet
            </button>
            <button className="flex-1 border border-white/20 py-3 rounded-xl font-semibold hover:bg-white/10 transition">
              Share Ticket
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
