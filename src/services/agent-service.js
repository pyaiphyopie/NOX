import { AgentSystem, DiscoveryAgent, MomentumAgent, SafetyAgent, ContextAgent, VibeAgent, MemoryAgent } from '../agents';
import { preferenceService } from './preference-service';

class AgentService {
  constructor() {
    this.agentSystem = new AgentSystem();
    this.initializeAgents();
  }

  initializeAgents() {
    // Register MVP agents
    this.agentSystem.registerAgent('discovery', new DiscoveryAgent());
    this.agentSystem.registerAgent('momentum', new MomentumAgent());
    this.agentSystem.registerAgent('safety', new SafetyAgent());
    // Register Phase 2 agents
    this.agentSystem.registerAgent('context', new ContextAgent());
    this.agentSystem.registerAgent('vibe', new VibeAgent());
    this.agentSystem.registerAgent('memory', new MemoryAgent());
  }

  async getRecommendations(userPreferences, citySignals) {
    // Get actual user preferences if not provided
    const actualPreferences = userPreferences || preferenceService.getPreferences();

    const input = {
      user_preferences: actualPreferences,
      live_city_signals: citySignals,
      venue_metadata: this.getVenueMetadata(),
      weather: citySignals.weather || {},
      social_activity: citySignals.socialActivity || {},
      // Safety agent inputs
      location_data: citySignals.locationData || {},
      crowd_density: citySignals.crowdDensity || {},
      incident_reports: citySignals.incidentReports || [],
      transport_status: citySignals.transportStatus || {},
      // Momentum agent inputs
      checkins: citySignals.checkins || {},
      rsvp_growth: citySignals.rsvpGrowth || {},
      uploads: citySignals.uploads || {},
      shares: citySignals.shares || {},
      occupancy: citySignals.occupancy || {},
      queue_times: citySignals.queueTimes || {},
      // Context agent inputs
      time: citySignals.time || new Date().toISOString(),
      location: citySignals.location || { district: 'Dagon Township', nearby: ['Bahan Township', 'Sanchaung'] },
      events: citySignals.events || this.getVenueMetadata(),
      transportation: citySignals.transportation || citySignals.transportStatus || {},
      // Vibe agent inputs
      venue_data: citySignals.venueData || this.getVenueMetadata(),
      crowd_data: citySignals.crowdData || {},
      music_data: citySignals.musicData || {},
      atmospheric_data: citySignals.atmosphericData || {},
      // Memory agent inputs
      user_history: citySignals.userHistory || [],
      user_actions: citySignals.userActions || [],
      feedback: citySignals.feedback || [],
      context: { userId: citySignals.userId || 'default', ...citySignals.context || {} }
    };

    return await this.agentSystem.execute(input);
  }

  getVenueMetadata() {
    // This would normally come from an API
    return [
      {
        id: '1',
        name: 'Warehouse 19',
        genre: 'Techno',
        location: 'Dagon Township',
        capacity: 1200,
        category: 'Club'
      },
      {
        id: '2',
        name: 'NOIR Rooftop',
        genre: 'Hip-Hop',
        location: 'Bahan Township',
        capacity: 500,
        category: 'Rooftop Bar'
      },
      {
        id: '3',
        name: 'Atlas Terrace',
        genre: 'House',
        location: 'Sanchaung',
        capacity: 300,
        category: 'Open-Air'
      },
      {
        id: '4',
        name: 'The Foundry',
        genre: 'Live Bands',
        location: 'Ahlone Township',
        capacity: 400,
        category: 'Live House'
      },
      {
        id: '5',
        name: 'Pulse Arena',
        genre: 'EDM',
        location: 'Hlaing Township',
        capacity: 2500,
        category: 'Arena'
      }
    ];
  }

  // Helper method to generate mock city signals for testing
  generateMockCitySignals() {
    return {
      weather: {
        condition: 'clear',
        temperature: 28,
        visibility: 1.0
      },
      socialActivity: {
        eventTrending: {
          '1': 0.8,
          '2': 0.6,
          '3': 0.4
        }
      },
      locationData: {
        'Dagon Township': { safetyScore: 0.7, lighting: 'good', surveillance: 'good' },
        'Bahan Township': { safetyScore: 0.8, lighting: 'good', surveillance: 'good' },
        'Sanchaung': { safetyScore: 0.6, lighting: 'medium', surveillance: 'medium' }
      },
      crowdDensity: {
        '1': { current: 842, capacity: 1200 },
        '2': { current: 320, capacity: 500 },
        '3': { current: 156, capacity: 300 }
      },
      incidentReports: [],
      transportStatus: {
        'route1': { type: 'outdoor', congestion: 0.3, status: 'normal' },
        'route2': { type: 'indoor', congestion: 0.5, status: 'normal' }
      },
      checkins: {
        '1': { recent: 150, previous: 120, current: 842, velocity: 0.25, historyLength: 15, consistency: 0.85 },
        '2': { recent: 80, previous: 70, current: 320, velocity: 0.14, historyLength: 12, consistency: 0.8 },
        '3': { recent: 40, previous: 35, current: 156, velocity: 0.14, historyLength: 10, consistency: 0.75 }
      },
      rsvpGrowth: {
        '1': 0.3,
        '2': 0.2,
        '3': 0.15
      },
      uploads: {
        '1': { recent: 25, previous: 20 },
        '2': { recent: 15, previous: 12 },
        '3': { recent: 8, previous: 6 }
      },
      shares: {
        '1': { recent: 45, previous: 35 },
        '2': { recent: 30, previous: 25 },
        '3': { recent: 12, previous: 10 }
      },
      occupancy: {
        '1': { current: 842, capacity: 1200 },
        '2': { current: 320, capacity: 500 },
        '3': { current: 156, capacity: 300 }
      },
      queueTimes: {
        '1': { average: 12, trend: 'stable', waitTime: 10 },
        '2': { average: 8, trend: 'increasing', waitTime: 15 },
        '3': { average: 5, trend: 'stable', waitTime: 5 }
      },
      // Context agent data
      time: new Date().toISOString(),
      location: { district: 'Dagon Township', nearby: ['Bahan Township', 'Sanchaung'] },
      events: this.getVenueMetadata(),
      transportation: {
        'route1': { type: 'outdoor', congestion: 0.3, status: 'normal' },
        'route2': { type: 'indoor', congestion: 0.5, status: 'normal' }
      },
      // Vibe agent data
      venueData: this.getVenueMetadata(),
      crowdData: {
        '1': { density: 0.7, vibe: 'positive', dancing: 'high', interaction: 'moderate', age: 'mixed-20s-30s', diversity: 'high' },
        '2': { density: 0.6, vibe: 'positive', dancing: 'moderate', interaction: 'high', age: '20s', diversity: 'medium' },
        '3': { density: 0.5, vibe: 'positive', dancing: 'low', interaction: 'high', age: '30s', diversity: 'medium' }
      },
      musicData: {
        '1': { genre: 'Techno', tempo: 135, bass: 'heavy', volume: 'high', variety: 0.6 },
        '2': { genre: 'Hip-Hop', tempo: 95, bass: 'heavy', volume: 'high', variety: 0.8 },
        '3': { genre: 'House', tempo: 125, bass: 'medium', volume: 'moderate', variety: 0.7 }
      },
      atmosphericData: {
        '1': { lighting: 'dynamic', acoustics: 'excellent', decor: 'immersive', temperature: 'comfortable', ventilation: 'good' },
        '2': { lighting: 'well-designed', acoustics: 'good', decor: 'themed', temperature: 'comfortable', ventilation: 'good' },
        '3': { lighting: 'well-designed', acoustics: 'good', decor: 'well-designed', temperature: 'comfortable', ventilation: 'good' }
      },
      // Memory agent data
      userHistory: [
        { id: '1', title: 'NEON DISTRICT', venue: 'Warehouse 19', category: 'Techno', location: 'Dagon Township' },
        { id: '2', title: 'AFTERHOURS', venue: 'NOIR Rooftop', category: 'Hip-Hop', location: 'Bahan Township' },
        { id: '1', title: 'NEON DISTRICT', venue: 'Warehouse 19', category: 'Techno', location: 'Dagon Township' },
        { id: '4', title: 'AMPLIFIED CITY', venue: 'The Foundry', category: 'Live Bands', location: 'Ahlone Township' }
      ],
      userActions: [
        { type: 'venue_visit', venue: 'Warehouse 19', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), groupSize: 3 },
        { type: 'venue_visit', venue: 'NOIR Rooftop', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), groupSize: 2 },
        { type: 'venue_visit', venue: 'Warehouse 19', timestamp: new Date(Date.now() - 86400000 * 7).toISOString(), groupSize: 4 },
        { type: 'ticket_purchase', price: 12, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
        { type: 'ticket_purchase', price: 18, timestamp: new Date(Date.now() - 86400000 * 5).toISOString() }
      ],
      feedback: [
        { sentiment: 'positive', genre: 'Techno', venue: 'Warehouse 19', factors: ['music', 'atmosphere'] },
        { sentiment: 'positive', genre: 'Hip-Hop', venue: 'NOIR Rooftop', factors: ['view', 'drinks'] }
      ],
      context: { userId: 'default' }
    };
  }
}

// Singleton instance
export const agentService = new AgentService();