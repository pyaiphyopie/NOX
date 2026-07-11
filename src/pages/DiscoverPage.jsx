import { useMemo, useState, useEffect } from 'react';
import { CATEGORIES, EVENTS } from '../data/events';
import EventCard from '../components/EventCard';
import { agentService } from '../services/agent-service';
import { preferenceService } from '../services/preference-service';

export default function DiscoverPage() {
  const [activeTag, setActiveTag] = useState('All');
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredEvents = useMemo(() => {
    const preferences = preferenceService.getPreferences();
    let events = activeTag === 'All' ? EVENTS : EVENTS.filter((e) => e.category === activeTag);

    // Apply user preferences to filter/rank events
    events = events.map(event => ({
      ...event,
      compatibilityScore: preferenceService.getEventCompatibility(event)
    }));

    // Sort by compatibility score
    events.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return events;
  }, [activeTag]);

  useEffect(() => {
    async function getAIRecommendations() {
      setIsAnalyzing(true);
      try {
        // Get user's actual preferences
        const userPreferences = preferenceService.getPreferences();

        const citySignals = agentService.generateMockCitySignals();
        const recommendations = await agentService.getRecommendations(userPreferences, citySignals);
        setAiRecommendations(recommendations);
      } catch (error) {
        console.error('Failed to get AI recommendations:', error);
        setAiRecommendations({ error: true, message: 'AI analysis temporarily unavailable' });
      } finally {
        setIsAnalyzing(false);
      }
    }

    getAIRecommendations();
  }, []);

  return (
    <>
      {/* AI Insights Section */}
      {isAnalyzing && (
        <section className="px-8 py-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                AI Intelligence Analyzing...
              </span>
            </div>
          </div>
        </section>
      )}

      {aiRecommendations && !isAnalyzing && (
        <section className="px-8 py-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
          <div className="max-w-7xl mx-auto">
            {aiRecommendations.error ? (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-red-300">
                  {aiRecommendations.message}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    AI Intelligence Active
                  </span>
                  {aiRecommendations.overridden && (
                    <span className="text-xs uppercase tracking-[0.2em] text-red-300">
                      Safety Override Active
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-5 gap-4">
                  {/* Discovery Insights */}
                  {aiRecommendations.results.discovery && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <h4 className="text-sm font-semibold text-cyan-300 mb-2">Discovery</h4>
                      <p className="text-xs text-white/60 line-clamp-2">
                        {aiRecommendations.results.discovery.reasoning?.[0] || 'Analyzing venue patterns...'}
                      </p>
                      <div className="mt-2 text-xs text-white/40">
                        {Math.round(aiRecommendations.results.discovery.confidence * 100)}% confident
                      </div>
                    </div>
                  )}

                  {/* Momentum Insights */}
                  {aiRecommendations.results.momentum && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">Momentum</h4>
                      <div className="text-xs text-white/60">
                        {Object.entries(aiRecommendations.results.momentum.momentumScores || {})
                          .slice(0, 2)
                          .map(([id, score]) => (
                            <div key={id} className="flex justify-between">
                              <span>Venue {id}</span>
                              <span>{Math.round(score * 100)}%</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Safety Status */}
                  {aiRecommendations.results.safety && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <h4 className="text-sm font-semibold text-emerald-300 mb-2">Safety</h4>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${aiRecommendations.results.safety.safetyAssessment.level === 'low' ? 'bg-emerald-400' :
                          aiRecommendations.results.safety.safetyAssessment.level === 'medium' ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`} />
                        <span className="text-xs text-white/60 capitalize">
                          {aiRecommendations.results.safety.safetyAssessment.level} risk
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Context Insights */}
                  {aiRecommendations.results.context && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <h4 className="text-sm font-semibold text-amber-300 mb-2">Context</h4>
                      <p className="text-xs text-white/60 line-clamp-2">
                        {aiRecommendations.results.context.overallSituation?.level || 'Analyzing context...'}
                      </p>
                      <div className="mt-2 text-xs text-white/40">
                        {aiRecommendations.results.context.timeContext?.timePeriod || 'Evening'}
                      </div>
                    </div>
                  )}

                  {/* Vibe Insights */}
                  {aiRecommendations.results.vibe && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <h4 className="text-sm font-semibold text-pink-300 mb-2">Vibe</h4>
                      <p className="text-xs text-white/60 line-clamp-2">
                        {aiRecommendations.results.vibe.overallVibe?.dominantVibe || 'Analyzing atmosphere...'}
                      </p>
                      <div className="mt-2 text-xs text-white/40">
                        {Math.round(aiRecommendations.results.vibe.overallVibe?.confidence * 100 || 0)}% match
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      )}

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
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
            {[
              ['300+', 'Events Planned'],
              ['50+', 'Promoters'],
              ['20+', 'Venues'],
            ].map(([v, l]) => (
              <div key={l}>
                <h3 className="text-3xl font-black text-cyan-400">{v}</h3>
                <p className="text-sm text-white/60 mt-1">{l}</p>
              </div>
            ))}
          </div>
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
              <div className="flex gap-2 overflow-x-auto pb-2 text-sm">
                {CATEGORIES.map((tag) => (
                  <button
                    key={tag}
                    className={`px-4 py-2 rounded-full border whitespace-nowrap transition ${activeTag === tag
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
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ['15K+', 'Monthly Users'],
            ['500+', 'Events Hosted'],
            ['98%', 'QR Success'],
            ['4.8★', 'Avg Rating'],
          ].map(([v, l]) => (
            <div key={l}>
              <h3 className="text-4xl font-black text-cyan-400">{v}</h3>
              <p className="text-white/50 mt-2 text-sm">{l}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
