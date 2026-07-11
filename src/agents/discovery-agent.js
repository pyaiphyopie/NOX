import { BaseAgent } from './agent-system';

export class DiscoveryAgent extends BaseAgent {
  constructor() {
    super({
      name: 'discovery',
      skills: [
        'venue_ranking',
        'event_matching',
        'vibe_analysis',
        'contextual_recommendation',
        'nightlife_categorization',
        'district_comparison',
        'trend_detection',
        'hidden_gem_detection',
        'crowd_compatibility_analysis',
        'itinerary_suggestions'
      ],
      inputs: ['user_preferences', 'live_city_signals', 'venue_metadata', 'weather', 'social_activity'],
      priority: 3
    });
  }

  async process(input) {
    if (!this.validateInput(input)) {
      throw new Error('Invalid input for DiscoveryAgent');
    }

    const { user_preferences, live_city_signals, venue_metadata, weather, social_activity } = input;

    // Venue ranking based on user preferences and live signals
    const rankedVenues = this.rankVenues(venue_metadata, user_preferences, live_city_signals);

    // Event matching with contextual factors
    const matchedEvents = this.matchEvents(venue_metadata, user_preferences, weather, social_activity);

    // Vibe analysis for atmosphere understanding
    const vibeAnalysis = this.analyzeVibe(venue_metadata, live_city_signals);

    return {
      rankedVenues,
      matchedEvents,
      vibeAnalysis,
      confidence: this.calculateConfidence(rankedVenues, matchedEvents),
      reasoning: this.buildReasoning(user_preferences, live_city_signals)
    };
  }

  rankVenues(venues, preferences, signals) {
    return venues.map(venue => {
      let score = 0;
      
      // Preference matching
      if (preferences.preferredGenres?.includes(venue.genre)) {
        score += 30;
      }
      if (preferences.preferredAreas?.includes(venue.location)) {
        score += 20;
      }
      
      // Live signal integration
      const momentum = signals.venueMomentum?.[venue.id] || 0;
      score += momentum * 0.5;
      
      // Capacity preference
      if (preferences.densityPreference === 'low' && venue.capacity < 500) {
        score += 15;
      } else if (preferences.densityPreference === 'high' && venue.capacity > 1000) {
        score += 15;
      }
      
      return { ...venue, score };
    }).sort((a, b) => b.score - a.score);
  }

  matchEvents(events, preferences, weather, socialActivity) {
    return events.filter(event => {
      // Weather consideration
      if (weather.condition === 'rain' && event.category === 'Rooftop') {
        return false;
      }
      
      // Social momentum
      const socialScore = socialActivity.eventTrending?.[event.id] || 0;
      if (socialScore < 0.3 && preferences.excludeQuiet) {
        return false;
      }
      
      // Genre preference
      if (preferences.preferredGenres?.length > 0) {
        return preferences.preferredGenres.includes(event.category);
      }
      
      return true;
    });
  }

  analyzeVibe(venues, signals) {
    return venues.map(venue => {
      const crowdData = signals.crowdData?.[venue.id] || {};
      
      let vibe = 'standard';
      if (crowdData.energy > 0.8) vibe = 'high-energy';
      else if (crowdData.energy < 0.3) vibe = 'chill';
      
      if (crowdData.age === 'young') vibe += '-youthful';
      else if (crowdData.age === 'mature') vibe += '-sophisticated';
      
      return {
        venueId: venue.id,
        vibe,
        energy: crowdData.energy || 0.5,
        crowdType: crowdData.type || 'mixed'
      };
    });
  }

  calculateConfidence(venues, events) {
    if (venues.length === 0 && events.length === 0) return 0;
    return Math.min(1, (venues.length + events.length) / 10);
  }

  buildReasoning(preferences, signals) {
    const reasons = [];
    
    if (preferences.preferredGenres?.length > 0) {
      reasons.push(`Matching genre preferences: ${preferences.preferredGenres.join(', ')}`);
    }
    
    if (signals.venueMomentum) {
      const trending = Object.entries(signals.venueMomentum)
        .filter(([_, score]) => score > 0.7)
        .map(([id]) => id);
      if (trending.length > 0) {
        reasons.push(`High momentum venues: ${trending.join(', ')}`);
      }
    }
    
    return reasons;
  }
}