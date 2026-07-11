import { BaseAgent } from './agent-system';

export class VibeAgent extends BaseAgent {
  constructor() {
    super({
      name: 'vibe',
      skills: [
        'emotional_environment_classification',
        'aesthetic_analysis',
        'energy_mapping',
        'sound_profile_analysis',
        'crowd_behavior_analysis',
        'ambiance_scoring',
        'cultural_alignment'
      ],
      inputs: ['venue_data', 'crowd_data', 'music_data', 'atmospheric_data'],
      priority: 5
    });
  }

  async process(input) {
    if (!this.validateInput(input)) {
      throw new Error('Invalid input for VibeAgent');
    }

    const { venue_data, crowd_data, music_data, atmospheric_data } = input;

    // Emotional environment classification
    const emotionalEnvironment = this.classifyEmotionalEnvironment(venue_data, atmospheric_data);
    
    // Aesthetic analysis
    const aestheticAnalysis = this.analyzeAesthetics(venue_data, atmospheric_data);
    
    // Energy mapping
    const energyMapping = this.mapEnergy(venue_data, crowd_data, music_data);
    
    // Sound profile analysis
    const soundProfile = this.analyzeSoundProfile(music_data, venue_data);
    
    // Crowd behavior analysis
    const crowdBehavior = this.analyzeCrowdBehavior(crowd_data, venue_data);
    
    // Ambiance scoring
    const ambianceScore = this.scoreAmbiance(venue_data, atmospheric_data, crowd_data);
    
    // Cultural alignment
    const culturalAlignment = this.analyzeCulturalAlignment(venue_data, crowd_data);

    return {
      emotionalEnvironment,
      aestheticAnalysis,
      energyMapping,
      soundProfile,
      crowdBehavior,
      ambianceScore,
      culturalAlignment,
      overallVibe: this.determineOverallVibe({
        emotionalEnvironment,
        energyMapping,
        crowdBehavior,
        ambianceScore
      }),
      vibeRecommendations: this.generateVibeRecommendations({
        emotionalEnvironment,
        energyMapping,
        crowdBehavior,
        ambianceScore
      }),
      timestamp: new Date().toISOString()
    };
  }

  classifyEmotionalEnvironment(venueData, atmosphericData) {
    const classifications = [];

    venueData.forEach(venue => {
      const atmosphere = atmosphericData[venue.id] || {};
      let emotionalTone = 'neutral';
      let emotionalIntensity = 'moderate';

      // Analyze venue characteristics
      if (venue.category === 'Rooftop') {
        emotionalTone = 'sophisticated';
        emotionalIntensity = 'moderate';
      } else if (venue.category === 'Techno' || venue.category === 'EDM') {
        emotionalTone = 'intense';
        emotionalIntensity = 'high';
      } else if (venue.category === 'Live Bands') {
        emotionalTone = 'intimate';
        emotionalIntensity = 'moderate';
      } else if (venue.category === 'Hip-Hop') {
        emotionalTone = 'energetic';
        emotionalIntensity = 'high';
      }

      // Adjust based on atmospheric data
      if (atmosphere.lighting === 'dim') {
        emotionalTone += '-moody';
      } else if (atmosphere.lighting === 'bright') {
        emotionalTone += '-upbeat';
      }

      if (atmosphere.decor === 'minimal') {
        emotionalTone += '-clean';
      } else if (atmosphere.decor === 'elaborate') {
        emotionalTone += '-rich';
      }

      classifications.push({
        venueId: venue.id,
        venue: venue.name,
        emotionalTone,
        emotionalIntensity,
        primaryEmotion: this.getPrimaryEmotion(emotionalTone),
        secondaryEmotions: this.getSecondaryEmotions(emotionalTone)
      });
    });

    return classifications;
  }

  analyzeAesthetics(venueData, atmosphericData) {
    const aesthetics = [];

    venueData.forEach(venue => {
      const atmosphere = atmosphericData[venue.id] || {};
      
      const aesthetic = {
        venueId: venue.id,
        venue: venue.name,
        visualStyle: this.determineVisualStyle(venue, atmosphere),
        colorPalette: this.determineColorPalette(venue, atmosphere),
        designElements: this.identifyDesignElements(venue, atmosphere),
        atmosphereRating: this.rateAtmosphere(venue, atmosphere),
        aestheticAppeal: this.assessAestheticAppeal(venue, atmosphere)
      };

      aesthetics.push(aesthetic);
    });

    return aesthetics;
  }

  mapEnergy(venueData, crowdData, musicData) {
    const energyMap = {};

    venueData.forEach(venue => {
      const crowd = crowdData[venue.id] || {};
      const music = musicData[venue.id] || {};

      let energyLevel = 0.5; // Base energy level

      // Music contribution to energy
      if (music.tempo > 120) energyLevel += 0.2;
      if (music.bass === 'heavy') energyLevel += 0.15;
      if (music.genre === 'EDM' || music.genre === 'Techno') energyLevel += 0.1;

      // Crowd contribution to energy
      if (crowd.density > 0.7) energyLevel += 0.15;
      if (crowd.activity === 'dancing') energyLevel += 0.2;
      if (crowd.mood === 'excited') energyLevel += 0.1;

      // Venue type contribution
      if (venue.category === 'EDM' || venue.category === 'Techno') {
        energyLevel += 0.1;
      } else if (venue.category === 'Live Bands') {
        energyLevel += 0.05;
      }

      energyLevel = Math.min(1, energyLevel);

      energyMap[venue.id] = {
        energyLevel,
        energyType: this.categorizeEnergy(energyLevel),
        energyCurve: this.predictEnergyCurve(venue, crowd, music),
        peakEnergyTime: this.estimatePeakEnergy(venue, crowd, music),
        sustainedEnergy: this.assessSustainedEnergy(venue, music)
      };
    });

    return energyMap;
  }

  analyzeSoundProfile(musicData, venueData) {
    const soundProfiles = {};

    venueData.forEach(venue => {
      const music = musicData[venue.id] || {};

      const soundProfile = {
        venueId: venue.id,
        venue: venue.name,
        primaryGenre: music.genre || venue.category,
        tempo: music.tempo || 120,
        bassLevel: music.bass || 'medium',
        volume: music.volume || 'moderate',
        soundCharacteristics: this.identifySoundCharacteristics(music, venue),
        audioQuality: this.assessAudioQuality(venue, music),
        soundSystem: this.describeSoundSystem(venue),
        musicVariety: this.assessMusicVariety(music),
        signatureSound: this.identifySignatureSound(music, venue)
      };

      soundProfiles[venue.id] = soundProfile;
    });

    return soundProfiles;
  }

  analyzeCrowdBehavior(crowdData, venueData) {
    const crowdBehaviors = {};

    venueData.forEach(venue => {
      const crowd = crowdData[venue.id] || {};

      const behavior = {
        venueId: venue.id,
        venue: venue.name,
        crowdDensity: crowd.density || 0.5,
        crowdComposition: this.analyzeCrowdComposition(crowd),
        socialDynamics: this.analyzeSocialDynamics(crowd),
        movementPatterns: this.analyzeMovementPatterns(crowd),
        interactionLevels: this.assessInteractionLevels(crowd),
        groupSizes: this.analyzeGroupSizes(crowd),
        demographicProfile: this.buildDemographicProfile(crowd),
        behavioralTrends: this.identifyBehavioralTrends(crowd)
      };

      crowdBehaviors[venue.id] = behavior;
    });

    return crowdBehaviors;
  }

  scoreAmbiance(venueData, atmosphericData, crowdData) {
    const ambianceScores = {};

    venueData.forEach(venue => {
      const atmosphere = atmosphericData[venue.id] || {};
      const crowd = crowdData[venue.id] || {};

      let score = 0.5; // Base score

      // Lighting contribution
      if (atmosphere.lighting === 'dynamic') score += 0.15;
      else if (atmosphere.lighting === 'well-designed') score += 0.1;
      else if (atmosphere.lighting === 'poor') score -= 0.1;

      // Sound contribution
      if (atmosphere.acoustics === 'excellent') score += 0.15;
      else if (atmosphere.acoustics === 'good') score += 0.1;
      else if (atmosphere.acoustics === 'poor') score -= 0.15;

      // Decor contribution
      if (atmosphere.decor === 'immersive') score += 0.15;
      else if (atmosphere.decor === 'themed') score += 0.1;
      else if (atmosphere.decor === 'basic') score -= 0.05;

      // Crowd contribution
      if (crowd.vibe === 'positive') score += 0.1;
      else if (crowd.vibe === 'negative') score -= 0.15;

      // Spaciousness
      const crowdDensity = crowd.density || 0.5;
      if (crowdDensity > 0.8) score -= 0.1;
      else if (crowdDensity < 0.3 && crowdDensity > 0.1) score += 0.1;

      score = Math.max(0, Math.min(1, score));

      ambianceScores[venue.id] = {
        overallScore: score,
        lightingScore: this.scoreLighting(atmosphere),
        acousticScore: this.scoreAcoustics(atmosphere),
        decorScore: this.scoreDecor(atmosphere),
        crowdScore: this.scoreCrowdAtmosphere(crowd),
        uniqueness: this.assessUniqueness(venue, atmosphere),
        comfort: this.assessComfort(venue, atmosphere, crowd)
      };
    });

    return ambianceScores;
  }

  analyzeCulturalAlignment(venueData, crowdData) {
    const culturalAlignments = [];

    venueData.forEach(venue => {
      const crowd = crowdData[venue.id] || {};

      const alignment = {
        venueId: venue.id,
        venue: venue.name,
        culturalThemes: this.identifyCulturalThemes(venue, crowd),
        localRelevance: this.assessLocalRelevance(venue, crowd),
        culturalAuthenticity: this.assessCulturalAuthenticity(venue, crowd),
        communityIntegration: this.assessCommunityIntegration(venue, crowd),
        culturalDiversity: this.assessCulturalDiversity(crowd),
        artisticExpression: this.assessArtisticExpression(venue, crowd),
        traditionalElements: this.identifyTraditionalElements(venue, crowd),
        modernFusion: this.identifyModernFusion(venue, crowd)
      };

      culturalAlignments.push(alignment);
    });

    return culturalAlignments;
  }

  determineOverallVibe(analysis) {
    const vibes = {
      'melancholic-jazz': 0,
      'chaotic-party': 0,
      'intimate-artistic': 0,
      'energetic-urban': 0,
      'sophisticated-lounge': 0,
      'underground-experimental': 0,
      'mainstream-commercial': 0,
      'cultural-authentic': 0
    };

    // Weight different components
    analysis.emotionalEnvironment.forEach(env => {
      if (env.emotionalTone.includes('intimate')) vibes['intimate-artistic'] += 0.3;
      if (env.emotionalTone.includes('intense')) vibes['chaotic-party'] += 0.4;
      if (env.emotionalTone.includes('sophisticated')) vibes['sophisticated-lounge'] += 0.3;
      if (env.emotionalTone.includes('energetic')) vibes['energetic-urban'] += 0.3;
    });

    Object.keys(analysis.energyMapping).forEach(venueId => {
      const energy = analysis.energyMapping[venueId];
      if (energy.energyLevel > 0.7) vibes['chaotic-party'] += 0.2;
      if (energy.energyLevel < 0.4) vibes['melancholic-jazz'] += 0.2;
      if (energy.energyType === 'sustained-high') vibes['energetic-urban'] += 0.2;
    });

    // Find dominant vibe
    let dominantVibe = 'mainstream-commercial';
    let maxScore = 0;

    Object.keys(vibes).forEach(vibe => {
      if (vibes[vibe] > maxScore) {
        maxScore = vibes[vibe];
        dominantVibe = vibe;
      }
    });

    return {
      dominantVibe,
      vibeScores: vibes,
      vibeDescription: this.describeVibe(dominantVibe),
      confidence: maxScore
    };
  }

  generateVibeRecommendations(analysis) {
    const recommendations = [];

    // Based on emotional environment
    analysis.emotionalEnvironment.forEach(env => {
      if (env.emotionalTone.includes('intense')) {
        recommendations.push({
          type: 'preparation',
          advice: 'High-energy environment - dress for movement and warmth',
          targetVenue: env.venue
        });
      }
      if (env.emotionalTone.includes('intimate')) {
        recommendations.push({
          type: 'social',
          advice: 'Intimate setting - good for conversations and smaller groups',
          targetVenue: env.venue
        });
      }
    });

    // Based on energy mapping
    Object.keys(analysis.energyMapping).forEach(venueId => {
      const energy = analysis.energyMapping[venueId];
      if (energy.energyLevel > 0.8) {
        recommendations.push({
          type: 'timing',
          advice: 'Peak energy - arrive prepared for high activity',
          targetVenue: venueId
        });
      }
    });

    // Based on crowd behavior
    Object.keys(analysis.crowdBehavior).forEach(venueId => {
      const crowd = analysis.crowdBehavior[venueId];
      if (crowd.crowdDensity > 0.8) {
        recommendations.push({
          type: 'comfort',
          advice: 'High crowd density - expect limited personal space',
          targetVenue: venueId
        });
      }
    });

    return recommendations;
  }

  // Helper methods
  getPrimaryEmotion(emotionalTone) {
    const emotionMap = {
      'intense': 'excitement',
      'intimate': 'connection',
      'sophisticated': 'refinement',
      'energetic': 'enthusiasm',
      'melancholic': 'nostalgia',
      'upbeat': 'joy'
    };

    for (const [key, value] of Object.entries(emotionMap)) {
      if (emotionalTone.includes(key)) return value;
    }
    return 'neutral';
  }

  getSecondaryEmotions(emotionalTone) {
    const emotions = [];
    if (emotionalTone.includes('moody')) emotions.push('mystery');
    if (emotionalTone.includes('clean')) emotions.push('clarity');
    if (emotionalTone.includes('rich')) emotions.push('luxury');
    if (emotionalTone.includes('upbeat')) emotions.push('positivity');
    return emotions;
  }

  determineVisualStyle(venue, atmosphere) {
    if (venue.category === 'Rooftop') return 'modern-minimalist';
    if (venue.category === 'Techno') return 'industrial-raw';
    if (venue.category === 'Live Bands') return 'vintage-collected';
    if (venue.category === 'Hip-Hop') return 'urban-street';
    return 'contemporary-mixed';
  }

  determineColorPalette(venue, atmosphere) {
    if (venue.category === 'Rooftop') return ['warm-gold', 'deep-blue', 'black'];
    if (venue.category === 'Techno') return ['neon-cyan', 'magenta', 'black'];
    if (venue.category === 'Live Bands') return ['warm-amber', 'brown', 'cream'];
    if (venue.category === 'Hip-Hop') return ['bold-red', 'black', 'silver'];
    return ['neutral-gray', 'white', 'accent-color'];
  }

  identifyDesignElements(venue, atmosphere) {
    const elements = [];
    if (venue.category === 'Rooftop') elements.push('skyline-views', 'open-air');
    if (venue.category === 'Techno') elements.push('industrial-structure', 'lighting-rig');
    if (venue.category === 'Live Bands') elements.push('stage-equipment', 'vintage-decor');
    if (atmosphere.decor === 'immersive') elements.push('themed-environment');
    return elements;
  }

  rateAtmosphere(venue, atmosphere) {
    let rating = 0.7;
    if (atmosphere.lighting === 'dynamic') rating += 0.1;
    if (atmosphere.acoustics === 'excellent') rating += 0.1;
    if (atmosphere.decor === 'immersive') rating += 0.1;
    return Math.min(1, rating);
  }

  assessAestheticAppeal(venue, atmosphere) {
    const factors = {
      visualImpact: atmosphere.lighting === 'dynamic' ? 'high' : 'medium',
      designCoherence: atmosphere.decor === 'immersive' ? 'high' : 'medium',
      uniqueness: venue.category === 'Rooftop' ? 'high' : 'medium',
      overall: 'appealing'
    };
    return factors;
  }

  categorizeEnergy(energyLevel) {
    if (energyLevel > 0.8) return 'high-intensity';
    if (energyLevel > 0.6) return 'moderate-high';
    if (energyLevel > 0.4) return 'moderate';
    if (energyLevel > 0.2) return 'low-moderate';
    return 'low-intensity';
  }

  predictEnergyCurve(venue, crowd, music) {
    return {
      pattern: 'rising-peak-sustained',
      peakTime: '23:00-01:00',
      duration: '4-6 hours',
      consistency: 'high'
    };
  }

  estimatePeakEnergy(venue, crowd, music) {
    if (venue.category === 'EDM' || venue.category === 'Techno') {
      return '00:00-02:00';
    }
    return '22:00-00:00';
  }

  assessSustainedEnergy(venue, music) {
    if (music.genre === 'Techno' || music.genre === 'EDM') {
      return 'high-sustained';
    }
    return 'moderate-sustained';
  }

  identifySoundCharacteristics(music, venue) {
    const characteristics = [];
    if (music.bass === 'heavy') characteristics.push('heavy-bass');
    if (music.tempo > 130) characteristics.push('fast-tempo');
    if (venue.category === 'Techno') characteristics.push('repetitive-beats');
    if (venue.category === 'Live Bands') characteristics.push('live-instruments');
    return characteristics;
  }

  assessAudioQuality(venue, music) {
    return venue.category === 'Live Bands' ? 'high-fidelity' : 'club-standard';
  }

  describeSoundSystem(venue) {
    if (venue.category === 'EDM' || venue.category === 'Techno') {
      return 'professional-club-system';
    }
    if (venue.category === 'Live Bands') {
      return 'live-performance-system';
    }
    return 'standard-sound-system';
  }

  assessMusicVariety(music) {
    return music.variety > 0.7 ? 'high-diversity' : 'focused-selection';
  }

  identifySignatureSound(music, venue) {
    if (venue.category === 'Techno') return 'industrial-techno';
    if (venue.category === 'Hip-Hop') return 'urban-hip-hop';
    if (venue.category === 'EDM') return 'festival-edm';
    return 'contemporary-mix';
  }

  analyzeCrowdComposition(crowd) {
    return {
      age: crowd.age || 'mixed-20s-30s',
      diversity: crowd.diversity || 'medium',
      socialGroups: crowd.socialGroups || 'mixed-sizes',
      returnRate: crowd.returnRate || 'regular'
    };
  }

  analyzeSocialDynamics(crowd) {
    return {
      interactionLevel: crowd.interaction || 'moderate',
      socialFlow: crowd.flow || 'dynamic',
      groupBehavior: crowd.groupBehavior || 'mixed-clusters',
      openness: crowd.openness || 'moderate'
    };
  }

  analyzeMovementPatterns(crowd) {
    return {
      danceActivity: crowd.dancing || 'moderate',
      circulation: crowd.circulation || 'active',
      gatheringPoints: crowd.gathering || 'distributed',
      energyFlow: crowd.energyFlow || 'continuous'
    };
  }

  assessInteractionLevels(crowd) {
    return {
      strangerInteraction: crowd.strangerInteraction || 'low',
      groupCohesion: crowd.groupCohesion || 'moderate',
      socialMixing: crowd.socialMixing || 'moderate',
      approachability: crowd.approachability || 'moderate'
    };
  }

  analyzeGroupSizes(crowd) {
    return {
      averageSize: crowd.avgGroupSize || 4,
      sizeDistribution: crowd.groupDistribution || 'mixed',
      soloAttendance: crowd.soloRate || 'low',
      largeGroups: crowd.largeGroupRate || 'low'
    };
  }

  buildDemographicProfile(crowd) {
    return {
      ageRange: crowd.ageRange || '21-35',
      gender: crowd.gender || 'balanced',
      background: crowd.background || 'diverse',
      interests: crowd.interests || ['music', 'socializing']
    };
  }

  identifyBehavioralTrends(crowd) {
    return {
      arrivalPattern: crowd.arrivalPattern || 'gradual',
      departurePattern: crowd.departurePattern || 'gradual',
      peakActivity: crowd.peakActivity || '22:00-00:00',
      trendDirection: crowd.trend || 'stable'
    };
  }

  scoreLighting(atmosphere) {
    const lightingScores = { 'dynamic': 0.9, 'well-designed': 0.8, 'basic': 0.5, 'poor': 0.3 };
    return lightingScores[atmosphere.lighting] || 0.5;
  }

  scoreAcoustics(atmosphere) {
    const acousticScores = { 'excellent': 0.9, 'good': 0.8, 'fair': 0.6, 'poor': 0.3 };
    return acousticScores[atmosphere.acoustics] || 0.5;
  }

  scoreDecor(atmosphere) {
    const decorScores = { 'immersive': 0.9, 'themed': 0.8, 'well-designed': 0.7, 'basic': 0.5, 'poor': 0.3 };
    return decorScores[atmosphere.decor] || 0.5;
  }

  scoreCrowdAtmosphere(crowd) {
    const vibeScores = { 'positive': 0.8, 'neutral': 0.5, 'negative': 0.2 };
    return vibeScores[crowd.vibe] || 0.5;
  }

  assessUniqueness(venue, atmosphere) {
    if (venue.category === 'Rooftop') return 'high';
    if (atmosphere.decor === 'immersive') return 'high';
    return 'moderate';
  }

  assessComfort(venue, atmosphere, crowd) {
    let comfort = 0.7;
    if (atmosphere.temperature === 'comfortable') comfort += 0.1;
    if (crowd.density < 0.6) comfort += 0.1;
    if (atmosphere.ventilation === 'good') comfort += 0.1;
    return Math.min(1, comfort);
  }

  identifyCulturalThemes(venue, crowd) {
    const themes = [];
    if (venue.category === 'Live Bands') themes.push('live-music-culture');
    if (crowd.background === 'local') themes.push('local-culture');
    if (venue.category === 'Techno') themes.push('electronic-culture');
    return themes;
  }

  assessLocalRelevance(venue, crowd) {
    return crowd.background === 'local' ? 'high' : 'moderate';
  }

  assessCulturalAuthenticity(venue, crowd) {
    return venue.category === 'Live Bands' ? 'high' : 'moderate';
  }

  assessCommunityIntegration(venue, crowd) {
    return crowd.localRate > 0.5 ? 'high' : 'moderate';
  }

  assessCulturalDiversity(crowd) {
    return crowd.diversity === 'high' ? 'high' : 'moderate';
  }

  assessArtisticExpression(venue, crowd) {
    return venue.category === 'Live Bands' ? 'high' : 'moderate';
  }

  identifyTraditionalElements(venue, crowd) {
    return venue.category === 'Live Bands' ? ['live-performance', 'traditional-instruments'] : [];
  }

  identifyModernFusion(venue, crowd) {
    return venue.category === 'EDM' || venue.category === 'Techno' ? 
      ['electronic-fusion', 'modern-production'] : [];
  }

  describeVibe(vibe) {
    const descriptions = {
      'melancholic-jazz': 'Mood-focused, intimate atmosphere with emotional depth',
      'chaotic-party': 'High-energy, intense environment with dynamic crowd energy',
      'intimate-artistic': 'Artistically inclined, sophisticated setting for meaningful connections',
      'energetic-urban': 'Urban energy with contemporary vibes and active social scene',
      'sophisticated-lounge': 'Refined atmosphere with premium aesthetics and relaxed energy',
      'underground-experimental': 'Cutting-edge, experimental environment for music enthusiasts',
      'mainstream-commercial': 'Popular, accessible environment with broad appeal',
      'cultural-authentic': 'Culturally rich environment with local significance and authenticity'
    };
    return descriptions[vibe] || 'Standard nightlife atmosphere';
  }
}