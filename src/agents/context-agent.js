import { BaseAgent } from './agent-system';

export class ContextAgent extends BaseAgent {
  constructor() {
    super({
      name: 'context',
      skills: [
        'weather_reasoning',
        'time_awareness',
        'district_awareness',
        'event_density_analysis',
        'transportation_context',
        'regional_behavior_patterns'
      ],
      inputs: ['weather', 'time', 'location', 'events', 'transportation'],
      priority: 2 // High priority -仅次于 safety
    });
  }

  async process(input) {
    if (!this.validateInput(input)) {
      throw new Error('Invalid input for ContextAgent');
    }

    const { weather, time, location, events, transportation } = input;

    // Weather reasoning for venue recommendations
    const weatherContext = this.analyzeWeatherContext(weather, events);
    
    // Time awareness for optimal timing
    const timeContext = this.analyzeTimeContext(time, events);
    
    // District awareness for location-based recommendations
    const districtContext = this.analyzeDistrictContext(location, events);
    
    // Event density analysis for crowd management
    const densityAnalysis = this.analyzeEventDensity(events, time);
    
    // Transportation context for accessibility
    const transportContext = this.analyzeTransportationContext(transportation, location);
    
    // Regional behavior patterns
    const behaviorPatterns = this.analyzeRegionalPatterns(location, time, events);

    return {
      weatherContext,
      timeContext,
      districtContext,
      densityAnalysis,
      transportContext,
      behaviorPatterns,
      overallSituation: this.assessOverallSituation({
        weatherContext,
        timeContext,
        districtContext,
        densityAnalysis,
        transportContext
      }),
      recommendations: this.generateContextualRecommendations({
        weatherContext,
        timeContext,
        districtContext,
        transportContext
      }),
      timestamp: new Date().toISOString()
    };
  }

  analyzeWeatherContext(weather, events) {
    const context = {
      condition: weather.condition || 'unknown',
      temperature: weather.temperature || 20,
      impact: 'neutral',
      affectedVenues: [],
      favorableVenues: []
    };

    // Analyze weather impact on different venue types
    events.forEach(event => {
      if (weather.condition === 'rain' && event.category === 'Rooftop') {
        context.affectedVenues.push({
          venueId: event.id,
          venue: event.venue,
          reason: 'Rooftop venue affected by rain',
          recommendation: 'Consider indoor alternatives'
        });
        context.impact = 'negative';
      } else if (weather.condition === 'clear' && event.category === 'Rooftop') {
        context.favorableVenues.push({
          venueId: event.id,
          venue: event.venue,
          reason: 'Perfect weather for rooftop experience'
        });
        context.impact = 'positive';
      }

      // Temperature considerations
      if (weather.temperature > 30 && event.category === 'Rooftop') {
        context.affectedVenues.push({
          venueId: event.id,
          venue: event.venue,
          reason: 'High temperature may affect comfort',
          recommendation: 'Indoor venues with AC recommended'
        });
      }
    });

    return context;
  }

  analyzeTimeContext(time, events) {
    const hour = new Date(time).getHours();
    const context = {
      currentHour: hour,
      timePeriod: this.getTimePeriod(hour),
      peakHours: this.getPeakHours(),
      optimalEvents: [],
      lateNightOptions: [],
      earlyEveningOptions: []
    };

    // Categorize events by time suitability
    events.forEach(event => {
      const eventHour = this.extractEventHour(event.time);
      
      if (eventHour === hour) {
        context.optimalEvents.push({
          eventId: event.id,
          event: event.title,
          venue: event.venue,
          status: 'happening_now'
        });
      } else if (eventHour > hour && eventHour <= hour + 2) {
        context.optimalEvents.push({
          eventId: event.id,
          event: event.title,
          venue: event.venue,
          status: 'starting_soon'
        });
      } else if (hour >= 23 && eventHour >= hour) {
        context.lateNightOptions.push({
          eventId: event.id,
          event: event.title,
          venue: event.venue
        });
      } else if (hour >= 18 && hour <= 21) {
        context.earlyEveningOptions.push({
          eventId: event.id,
          event: event.title,
          venue: event.venue
        });
      }
    });

    return context;
  }

  analyzeDistrictContext(location, events) {
    const context = {
      currentDistrict: location.district || 'unknown',
      nearbyDistricts: location.nearby || [],
      districtEvents: {},
      districtVibe: {},
      accessibility: {}
    };

    // Group events by district
    events.forEach(event => {
      const district = event.location || 'unknown';
      if (!context.districtEvents[district]) {
        context.districtEvents[district] = [];
      }
      context.districtEvents[district].push({
        eventId: event.id,
        event: event.title,
        venue: event.venue,
        category: event.category
      });
    });

    // Analyze district vibes based on event types
    Object.keys(context.districtEvents).forEach(district => {
      const events = context.districtEvents[district];
      const categories = events.map(e => e.category);
      const dominantCategory = this.getMostFrequent(categories);
      
      context.districtVibe[district] = {
        dominantVibe: this.mapCategoryToVibe(dominantCategory),
        eventCount: events.length,
        diversity: this.calculateDiversity(categories)
      };
    });

    // Assess accessibility from current location
    if (location.district) {
      Object.keys(context.districtEvents).forEach(district => {
        const distance = this.calculateDistance(location.district, district);
        context.accessibility[district] = {
          distance,
          travelTime: this.estimateTravelTime(distance),
          accessibility: distance < 5 ? 'high' : distance < 10 ? 'medium' : 'low'
        };
      });
    }

    return context;
  }

  analyzeEventDensity(events, time) {
    const hour = new Date(time).getHours();
    const context = {
      overallDensity: 'medium',
      peakDistricts: [],
      quietDistricts: [],
      crowdedVenues: [],
      optimalTiming: []
    };

    // Calculate density by district
    const districtCounts = {};
    events.forEach(event => {
      const district = event.location || 'unknown';
      districtCounts[district] = (districtCounts[district] || 0) + 1;
    });

    // Identify peak and quiet districts
    const avgDensity = Object.values(districtCounts).reduce((a, b) => a + b, 0) / Object.keys(districtCounts).length;
    
    Object.keys(districtCounts).forEach(district => {
      if (districtCounts[district] > avgDensity * 1.5) {
        context.peakDistricts.push({
          district,
          eventCount: districtCounts[district],
          recommendation: 'Expect crowds, plan accordingly'
        });
      } else if (districtCounts[district] < avgDensity * 0.5) {
        context.quietDistricts.push({
          district,
          eventCount: districtCounts[district],
          recommendation: 'Less crowded, good for relaxed experience'
        });
      }
    });

    // Analyze venue crowding based on capacity
    events.forEach(event => {
      const occupancyRatio = event.attendance / event.capacity;
      if (occupancyRatio > 0.8) {
        context.crowdedVenues.push({
          venueId: event.id,
          venue: event.venue,
          occupancy: `${Math.round(occupancyRatio * 100)}%`,
          recommendation: 'High occupancy, expect wait times'
        });
      }
    });

    // Optimal timing suggestions
    if (hour >= 22 && hour <= 24) {
      context.optimalTiming.push({
        time: 'Current',
        reason: 'Peak nightlife hours',
        advice: 'Venues at maximum capacity'
      });
    } else if (hour >= 20 && hour < 22) {
      context.optimalTiming.push({
        time: 'Current',
        reason: 'Pre-peak window',
        advice: 'Good time to arrive before crowds'
      });
    } else if (hour >= 2 && hour <= 4) {
      context.optimalTiming.push({
        time: 'Current',
        reason: 'After-hours',
        advice: 'Late-night venues still active'
      });
    }

    return context;
  }

  analyzeTransportationContext(transportation, location) {
    const context = {
      overallStatus: 'normal',
      availableOptions: [],
      disruptedRoutes: [],
      peakHours: [],
      recommendations: []
    };

    // Analyze transportation status
    Object.keys(transportation).forEach(routeId => {
      const route = transportation[routeId];
      
      if (route.status === 'disrupted') {
        context.disruptedRoutes.push({
          routeId,
          type: route.type,
          reason: route.reason || 'Unknown disruption',
          alternative: this.findAlternativeRoute(routeId, transportation)
        });
        context.overallStatus = 'disrupted';
      } else if (route.congestion > 0.7) {
        context.recommendations.push({
          routeId,
          issue: 'High congestion',
          advice: 'Allow extra travel time or consider alternative'
        });
      }

      context.availableOptions.push({
        routeId,
        type: route.type,
        status: route.status,
        congestion: route.congestion
      });
    });

    // Identify peak transportation hours
    const currentHour = new Date().getHours();
    if ((currentHour >= 17 && currentHour <= 19) || (currentHour >= 22 && currentHour <= 24)) {
      context.peakHours.push({
        time: 'Current',
        level: 'high',
        advice: 'Peak transportation hours - expect delays'
      });
    }

    return context;
  }

  analyzeRegionalPatterns(location, time, events) {
    const context = {
      regionalVibe: 'standard',
      culturalEvents: [],
      localSpecialties: [],
      seasonalPatterns: [],
      behavioralInsights: []
    };

    // Analyze regional patterns based on location
    if (location.district) {
      const districtEvents = events.filter(e => e.location === location.district);
      
      // Identify cultural events
      districtEvents.forEach(event => {
        if (event.tags?.includes('Cultural') || event.genre?.includes('Traditional')) {
          context.culturalEvents.push({
            eventId: event.id,
            event: event.title,
            venue: event.venue,
            significance: 'Local cultural experience'
          });
        }
      });

      // Local venue specialties
      const venueCategories = districtEvents.map(e => e.category);
      const specialty = this.getMostFrequent(venueCategories);
      if (specialty) {
        context.localSpecialties.push({
          district: location.district,
          specialty: this.mapCategoryToSpecialty(specialty),
          description: `This district is known for ${specialty.toLowerCase()} venues`
        });
      }
    }

    // Seasonal patterns
    const month = new Date().getMonth();
    if (month >= 5 && month <= 8) { // Summer months
      context.seasonalPatterns.push({
        season: 'Summer',
        pattern: 'Outdoor venues peak in popularity',
        advice: 'Rooftop and open-air venues in high demand'
      });
    } else if (month >= 11 || month <= 1) { // Winter months
      context.seasonalPatterns.push({
        season: 'Winter',
        pattern: 'Indoor venues preferred',
        advice: 'Cozy indoor venues and intimate spaces'
      });
    }

    // Behavioral insights
    const hour = new Date(time).getHours();
    if (hour >= 23) {
      context.behavioralInsights.push({
        pattern: 'Late-night surge',
        description: 'Crowd transitions to after-hours venues',
        advice: 'Late-night venues become primary destinations'
      });
    } else if (hour >= 20 && hour < 23) {
      context.behavioralInsights.push({
        pattern: 'Prime time arrival',
        description: 'Peak venue entry period',
        advice: 'Expected longest wait times at popular venues'
      });
    }

    return context;
  }

  assessOverallSituation(contexts) {
    let score = 0;
    const factors = [];

    if (contexts.weatherContext.impact === 'negative') {
      score -= 2;
      factors.push('Weather conditions suboptimal');
    } else if (contexts.weatherContext.impact === 'positive') {
      score += 1;
      factors.push('Weather conditions favorable');
    }

    if (contexts.timeContext.optimalEvents.length > 0) {
      score += 2;
      factors.push('Optimal timing for events');
    }

    if (contexts.densityAnalysis.peakDistricts.length > 0) {
      score -= 1;
      factors.push('High event density in some areas');
    }

    if (contexts.transportContext.overallStatus === 'disrupted') {
      score -= 2;
      factors.push('Transportation disruptions present');
    }

    if (score >= 2) {
      return { level: 'favorable', score, factors };
    } else if (score >= 0) {
      return { level: 'neutral', score, factors };
    } else {
      return { level: 'challenging', score, factors };
    }
  }

  generateContextualRecommendations(contexts) {
    const recommendations = [];

    // Weather-based recommendations
    if (contexts.weatherContext.affectedVenues.length > 0) {
      recommendations.push({
        type: 'weather',
        priority: 'high',
        action: 'Consider indoor alternatives',
        reason: contexts.weatherContext.affectedVenues[0].reason
      });
    }

    // Time-based recommendations
    if (contexts.timeContext.optimalEvents.length > 0) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        action: 'Events happening now',
        reason: `${contexts.timeContext.optimalEvents.length} events currently active`
      });
    }

    // Density-based recommendations
    if (contexts.densityAnalysis.quietDistricts.length > 0) {
      recommendations.push({
        type: 'crowd',
        priority: 'low',
        action: 'Consider quieter districts',
        reason: contexts.densityAnalysis.quietDistricts[0].recommendation
      });
    }

    // Transportation-based recommendations
    if (contexts.transportContext.disruptedRoutes.length > 0) {
      recommendations.push({
        type: 'transport',
        priority: 'high',
        action: 'Check alternative routes',
        reason: contexts.transportContext.disruptedRoutes[0].reason
      });
    }

    return recommendations;
  }

  // Helper methods
  getTimePeriod(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    if (hour >= 21 && hour < 24) return 'night';
    return 'late_night';
  }

  getPeakHours() {
    return [20, 21, 22, 23]; // Typical nightlife peak hours
  }

  extractEventTime(timeString) {
    // Parse time string like "Tonight • 11:00 PM"
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const period = match[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return { hours, minutes };
    }
    return { hours: 21, minutes: 0 }; // Default to 9 PM
  }

  extractEventHour(timeString) {
    return this.extractEventTime(timeString).hours;
  }

  getMostFrequent(array) {
    const counts = {};
    let maxCount = 0;
    let mostFrequent = null;
    
    array.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
      if (counts[item] > maxCount) {
        maxCount = counts[item];
        mostFrequent = item;
      }
    });
    
    return mostFrequent;
  }

  calculateDiversity(array) {
    const unique = new Set(array).size;
    const total = array.length;
    return total > 0 ? unique / total : 0;
  }

  mapCategoryToVibe(category) {
    const vibeMap = {
      'Techno': 'underground',
      'Hip-Hop': 'energetic',
      'EDM': 'festival',
      'Live Bands': 'intimate',
      'Rooftop': 'sophisticated'
    };
    return vibeMap[category] || 'standard';
  }

  mapCategoryToSpecialty(category) {
    const specialtyMap = {
      'Techno': 'Underground electronic music',
      'Hip-Hop': 'Urban music culture',
      'EDM': 'Large-scale electronic events',
      'Live Bands': 'Live music performances',
      'Rooftop': 'Skyline entertainment'
    };
    return specialtyMap[category] || 'Nightlife entertainment';
  }

  calculateDistance(district1, district2) {
    // Simplified distance calculation - in production would use real geospatial data
    if (district1 === district2) return 0;
    return Math.random() * 15 + 1; // Random distance between 1-16 km
  }

  estimateTravelTime(distance) {
    // Estimate travel time based on distance (assuming average speed of 30 km/h in city)
    return Math.round(distance * 2); // 2 minutes per km
  }

  findAlternativeRoute(disruptedRouteId, transportation) {
    const alternatives = Object.keys(transportation)
      .filter(id => id !== disruptedRouteId && transportation[id].status === 'normal')
      .slice(0, 2);
    
    return alternatives.length > 0 ? alternatives : ['taxi', 'ride-share'];
  }
}