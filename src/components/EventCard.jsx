import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  return (
    <Link
      to={`/event/${event.id}`}
      className="block w-full text-left bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:scale-[1.02] hover:border-cyan-400/40 transition no-underline"
    >
      <img src={event.image} alt={event.title} className="h-44 w-full object-cover" />
      <div className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 className="text-xl font-black text-white">{event.title}</h4>
            <p className="text-cyan-400 text-sm mt-1">{event.venue}</p>
          </div>
          <div className="bg-cyan-500 text-black text-sm font-black px-3 py-1 rounded-full">
            ${event.price}
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
    </Link>
  );
}
