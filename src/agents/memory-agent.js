import { BaseAgent } from './agent-system';

export class MemoryAgent extends BaseAgent {
  constructor() {
    super({
      name: 'memory',
      skills: [
        'preference_tracking',
        'behavior_pattern_learning',
        'long_term_profile_building',
        'contextual_memory_retrieval',
        'habit_detection',
        'recommendation_feedback_learning'
      ],
      inputs: ['user_history', 'user_actions', 'feedback', 'context'],
      priority: 6
    });

    // Initialize memory storage
    this.memoryStore = {
      userProfiles: new Map(),
      behaviorPatterns: new Map(),
      contextualMemories: new Map(),
      feedbackHistory: new Map()
    };
  }

  async process(input) {
    if (!this.validateInput(input)) {
      throw new Error('Invalid input for MemoryAgent');
    }

    const { user_history, user_actions, feedback, context } = input;
    const userId = context.userId || 'default';

    // Track and update user preferences
    const updatedPreferences = this.trackPreferences(userId, user_history, user_actions);
    
    // Learn behavior patterns
    const behaviorPatterns = this.learnBehaviorPatterns(userId, user_history, user_actions);
    
    // Build long-term profile
    const userProfile = this.buildUserProfile(userId, updatedPreferences, behaviorPatterns);
    
    // Retrieve contextual memories
    const contextualMemories = this.retrieveContextualMemories(userId, context);
    
    // Detect habits
    const habits = this.detectHabits(userId, user_history, user_actions);
    
    // Learn from feedback
    const feedbackLearning = this.learnFromFeedback(userId, feedback);

    return {
      updatedPreferences,
      behaviorPatterns,
      userProfile,
      contextualMemories,
      habits,
      feedbackLearning,
      personalizationInsights: this.generatePersonalizationInsights({
        updatedPreferences,
        behaviorPatterns,
        habits,
        contextualMemories
      }),
      timestamp: new Date().toISOString()
    };
  }

  trackPreferences(userId, userHistory, userActions) {
    const existingProfile = this.memoryStore.userProfiles.get(userId) || {
      preferredGenres: [],
      preferredVenues: [],
      preferredAreas: [],
      dislikedGenres: [],
      dislikedVenues: [],
      densityPreference: 'medium',
      timePreference: 'evening',
      budgetRange: { min: 0, max: 50 },
      socialPreference: 'mixed',
      musicIntensity: 'moderate'
    };

    // Analyze user history for genre preferences
    const genreCounts = {};
    userHistory.forEach(event => {
      if (event.category) {
        genreCounts[event.category] = (genreCounts[event.category] || 0) + 1;
      }
    });

    // Update preferred genres based on frequency
    Object.keys(genreCounts).forEach(genre => {
      if (genreCounts[genre] >= 3 && !existingProfile.preferredGenres.includes(genre)) {
        existingProfile.preferredGenres.push(genre);
      }
    });

    // Analyze venue preferences
    const venueCounts = {};
    userHistory.forEach(event => {
      if (event.venue) {
        venueCounts[event.venue] = (venueCounts[event.venue] || 0) + 1;
      }
    });

    Object.keys(venueCounts).forEach(venue => {
      if (venueCounts[venue] >= 2 && !existingProfile.preferredVenues.includes(venue)) {
        existingProfile.preferredVenues.push(venue);
      }
    });

    // Analyze area preferences
    const areaCounts = {};
    userHistory.forEach(event => {
      if (event.location) {
        areaCounts[event.location] = (areaCounts[event.location] || 0) + 1;
      }
    });

    Object.keys(areaCounts).forEach(area => {
      if (areaCounts[area] >= 2 && !existingProfile.preferredAreas.includes(area)) {
        existingProfile.preferredAreas.push(area);
      }
    });

    // Analyze time preferences from user actions
    const timeActions = userActions.filter(action => action.type === 'venue_visit');
    if (timeActions.length > 0) {
      const hours = timeActions.map(action => new Date(action.timestamp).getHours());
      const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
      
      if (avgHour >= 20 && avgHour <= 23) {
        existingProfile.timePreference = 'evening';
      } else if (avgHour >= 23) {
        existingProfile.timePreference = 'late_night';
      } else if (avgHour >= 18 && avgHour < 20) {
        existingProfile.timePreference = 'early_evening';
      }
    }

    // Analyze budget from user actions
    const priceActions = userActions.filter(action => action.type === 'ticket_purchase');
    if (priceActions.length > 0) {
      const prices = priceActions.map(action => action.price);
      existingProfile.budgetRange = {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    }

    // Store updated profile
    this.memoryStore.userProfiles.set(userId, existingProfile);

    return existingProfile;
  }

  learnBehaviorPatterns(userId, userHistory, userActions) {
    const existingPatterns = this.memoryStore.behaviorPatterns.get(userId) || {
      visitFrequency: 'occasional',
      groupSize: 'mixed',
      explorationTendency: 'moderate',
      loyaltyLevel: 'exploring',
      peakActivityHours: [],
      commonRoutes: [],
      decisionFactors: []
    };

    // Analyze visit frequency
    const visitsLastMonth = userActions.filter(action => {
      const actionDate = new Date(action.timestamp);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return action.type === 'venue_visit' && actionDate > monthAgo;
    }).length;

    if (visitsLastMonth >= 8) {
      existingPatterns.visitFrequency = 'frequent';
    } else if (visitsLastMonth >= 4) {
      existingPatterns.visitFrequency = 'regular';
    } else {
      existingPatterns.visitFrequency = 'occasional';
    }

    // Analyze group size patterns
    const groupActions = userActions.filter(action => action.type === 'venue_visit' && action.groupSize);
    if (groupActions.length > 0) {
      const avgGroupSize = groupActions.reduce((sum, action) => sum + action.groupSize, 0) / groupActions.length;
      if (avgGroupSize <= 2) {
        existingPatterns.groupSize = 'small';
      } else if (avgGroupSize <= 4) {
        existingPatterns.groupSize = 'medium';
      } else {
        existingPatterns.groupSize = 'large';
      }
    }

    // Analyze exploration tendency
    const uniqueVenues = new Set(userHistory.map(event => event.venue)).size;
    const totalVisits = userHistory.length;
    const explorationRatio = uniqueVenues / totalVisits;

    if (explorationRatio > 0.7) {
      existingPatterns.explorationTendency = 'high';
    } else if (explorationRatio > 0.4) {
      existingPatterns.explorationTendency = 'moderate';
    } else {
      existingPatterns.explorationTendency = 'low';
    }

    // Analyze loyalty level
    const venueCounts = {};
    userHistory.forEach(event => {
      venueCounts[event.venue] = (venueCounts[event.venue] || 0) + 1;
    });

    const maxVisits = Math.max(...Object.values(venueCounts));
    if (maxVisits >= 5) {
      existingPatterns.loyaltyLevel = 'loyal';
    } else if (maxVisits >= 3) {
      existingPatterns.loyaltyLevel = 'developing';
    } else {
      existingPatterns.loyaltyLevel = 'exploring';
    }

    // Analyze peak activity hours
    const visitHours = userActions
      .filter(action => action.type === 'venue_visit')
      .map(action => new Date(action.timestamp).getHours());
    
    if (visitHours.length > 0) {
      const hourCounts = {};
      visitHours.forEach(hour => {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      
      existingPatterns.peakActivityHours = Object.keys(hourCounts)
        .sort((a, b) => hourCounts[b] - hourCounts[a])
        .slice(0, 3)
        .map(Number);
    }

    // Store updated patterns
    this.memoryStore.behaviorPatterns.set(userId, existingPatterns);

    return existingPatterns;
  }

  buildUserProfile(userId, preferences, patterns) {
    const profile = {
      userId,
      preferences,
      patterns,
      profileStrength: this.calculateProfileStrength(preferences, patterns),
      userSegment: this.determineUserSegment(preferences, patterns),
      personalizationLevel: this.calculatePersonalizationLevel(preferences, patterns),
      lastUpdated: new Date().toISOString()
    };

    return profile;
  }

  retrieveContextualMemories(userId, context) {
    const existingMemories = this.memoryStore.contextualMemories.get(userId) || [];
    
    // Filter memories based on current context
    const relevantMemories = existingMemories.filter(memory => {
      // Time relevance
      const currentHour = new Date().getHours();
      const memoryHour = new Date(memory.timestamp).getHours();
      const timeRelevance = Math.abs(currentHour - memoryHour) <= 2;

      // Location relevance
      const locationRelevance = !context.location || 
        memory.location === context.location ||
        (context.nearby && context.nearby.includes(memory.location));

      // Weather relevance
      const weatherRelevance = !context.weather || 
        memory.weather === context.weather;

      return timeRelevance && locationRelevance && weatherRelevance;
    });

    return {
      relevantMemories: relevantMemories.slice(0, 5),
      totalMemories: existingMemories.length,
      lastMemoryContext: existingMemories.length > 0 ? existingMemories[existingMemories.length - 1] : null
    };
  }

  detectHabits(userId, userHistory, userActions) {
    const habits = [];

    // Detect recurring venue visits
    const venueVisits = {};
    userActions.filter(action => action.type === 'venue_visit').forEach(action => {
      const venue = action.venue;
      const dayOfWeek = new Date(action.timestamp).getDay();
      const key = `${venue}-${dayOfWeek}`;
      
      if (!venueVisits[key]) {
        venueVisits[key] = { count: 0, venue, dayOfWeek };
      }
      venueVisits[key].count++;
    });

    Object.keys(venueVisits).forEach(key => {
      const habit = venueVisits[key];
      if (habit.count >= 3) {
        habits.push({
          type: 'recurring_venue',
          venue: habit.venue,
          dayOfWeek: habit.dayOfWeek,
          frequency: habit.count,
          confidence: Math.min(1, habit.count / 5)
        });
      }
    });

    // Detect time-based habits
    const timeSlots = {};
    userActions.filter(action => action.type === 'venue_visit').forEach(action => {
      const hour = new Date(action.timestamp).getHours();
      const timeSlot = Math.floor(hour / 2) * 2; // Group into 2-hour slots
      
      if (!timeSlots[timeSlot]) {
        timeSlots[timeSlot] = { count: 0, timeSlot };
      }
      timeSlots[timeSlot].count++;
    });

    Object.keys(timeSlots).forEach(key => {
      const habit = timeSlots[key];
      if (habit.count >= 4) {
        habits.push({
          type: 'time_preference',
          timeSlot: habit.timeSlot,
          frequency: habit.count,
          confidence: Math.min(1, habit.count / 8)
        });
      }
    });

    // Detect genre habits
    const genrePreferences = {};
    userHistory.forEach(event => {
      const genre = event.category;
      if (!genrePreferences[genre]) {
        genrePreferences[genre] = { count: 0, genre };
      }
      genrePreferences[genre].count++;
    });

    Object.keys(genrePreferences).forEach(key => {
      const habit = genrePreferences[key];
      if (habit.count >= 4) {
        habits.push({
          type: 'genre_preference',
          genre: habit.genre,
          frequency: habit.count,
          confidence: Math.min(1, habit.count / (userHistory.length * 0.6))
        });
      }
    });

    return habits.sort((a, b) => b.confidence - a.confidence);
  }

  learnFromFeedback(userId, feedback) {
    const existingFeedback = this.memoryStore.feedbackHistory.get(userId) || [];
    
    // Add new feedback to history
    const updatedFeedback = [...existingFeedback, ...feedback];
    
    // Analyze feedback patterns
    const positiveFeedback = updatedFeedback.filter(f => f.sentiment === 'positive');
    const negativeFeedback = updatedFeedback.filter(f => f.sentiment === 'negative');
    
    const learning = {
      totalFeedbackCount: updatedFeedback.length,
      positiveRatio: positiveFeedback.length / updatedFeedback.length,
      commonPositiveFactors: this.extractCommonFactors(positiveFeedback),
      commonNegativeFactors: this.extractCommonFactors(negativeFeedback),
      preferenceAdjustments: this.calculatePreferenceAdjustments(updatedFeedback),
      lastFeedback: feedback.length > 0 ? feedback[feedback.length - 1] : null
    };

    // Store updated feedback
    this.memoryStore.feedbackHistory.set(userId, updatedFeedback);

    return learning;
  }

  generatePersonalizationInsights(data) {
    const { updatedPreferences, behaviorPatterns, habits, contextualMemories } = data;
    const insights = [];

    // Preference-based insights
    if (updatedPreferences.preferredGenres.length > 0) {
      insights.push({
        type: 'preference',
        insight: `User prefers ${updatedPreferences.preferredGenres.slice(0, 2).join(' and ')} events`,
        confidence: 0.8
      });
    }

    // Pattern-based insights
    if (behaviorPatterns.loyaltyLevel === 'loyal') {
      insights.push({
        type: 'loyalty',
        insight: 'User shows strong loyalty to favorite venues',
        confidence: 0.7
      });
    }

    if (behaviorPatterns.explorationTendency === 'high') {
      insights.push({
        type: 'exploration',
        insight: 'User enjoys discovering new venues and experiences',
        confidence: 0.75
      });
    }

    // Habit-based insights
    const strongHabits = habits.filter(h => h.confidence > 0.7);
    if (strongHabits.length > 0) {
      strongHabits.forEach(habit => {
        insights.push({
          type: 'habit',
          insight: this.formatHabitInsight(habit),
          confidence: habit.confidence
        });
      });
    }

    // Contextual insights
    if (contextualMemories.relevantMemories.length > 0) {
      insights.push({
        type: 'context',
        insight: 'User has relevant past experiences in similar context',
        confidence: 0.6
      });
    }

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  // Helper methods
  calculateProfileStrength(preferences, patterns) {
    let strength = 0;
    
    if (preferences.preferredGenres.length > 0) strength += 0.2;
    if (preferences.preferredVenues.length > 0) strength += 0.15;
    if (preferences.preferredAreas.length > 0) strength += 0.15;
    if (patterns.visitFrequency !== 'occasional') strength += 0.2;
    if (patterns.loyaltyLevel !== 'exploring') strength += 0.15;
    if (patterns.peakActivityHours.length > 0) strength += 0.15;

    return Math.min(1, strength);
  }

  determineUserSegment(preferences, patterns) {
    if (patterns.loyaltyLevel === 'loyal' && patterns.explorationTendency === 'low') {
      return 'loyalist';
    }
    if (patterns.explorationTendency === 'high' && patterns.visitFrequency === 'frequent') {
      return 'explorer';
    }
    if (preferences.preferredGenres.includes('Techno') || preferences.preferredGenres.includes('EDM')) {
      return 'electronic_enthusiast';
    }
    if (preferences.preferredGenres.includes('Live Bands')) {
      return 'live_music_fan';
    }
    if (patterns.visitFrequency === 'occasional') {
      return 'casual_user';
    }
    return 'mainstream_user';
  }

  calculatePersonalizationLevel(preferences, patterns) {
    const profileStrength = this.calculateProfileStrength(preferences, patterns);
    
    if (profileStrength > 0.8) return 'high';
    if (profileStrength > 0.5) return 'medium';
    return 'low';
  }

  extractCommonFactors(feedbackItems) {
    const factors = {};
    feedbackItems.forEach(item => {
      if (item.factors) {
        item.factors.forEach(factor => {
          factors[factor] = (factors[factor] || 0) + 1;
        });
      }
    });

    return Object.keys(factors)
      .map(factor => ({ factor, count: factors[factor] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.factor);
  }

  calculatePreferenceAdjustments(feedback) {
    const adjustments = {
      increaseGenres: [],
      decreaseGenres: [],
      increaseVenues: [],
      decreaseVenues: []
    };

    feedback.forEach(item => {
      if (item.sentiment === 'positive' && item.genre) {
        if (!adjustments.increaseGenres.includes(item.genre)) {
          adjustments.increaseGenres.push(item.genre);
        }
      }
      if (item.sentiment === 'negative' && item.genre) {
        if (!adjustments.decreaseGenres.includes(item.genre)) {
          adjustments.decreaseGenres.push(item.genre);
        }
      }
      if (item.sentiment === 'positive' && item.venue) {
        if (!adjustments.increaseVenues.includes(item.venue)) {
          adjustments.increaseVenues.push(item.venue);
        }
      }
      if (item.sentiment === 'negative' && item.venue) {
        if (!adjustments.decreaseVenues.includes(item.venue)) {
          adjustments.decreaseVenues.push(item.venue);
        }
      }
    });

    return adjustments;
  }

  formatHabitInsight(habit) {
    switch (habit.type) {
      case 'recurring_venue':
        return `Frequently visits ${habit.venue} on ${this.getDayName(habit.dayOfWeek)}`;
      case 'time_preference':
        return `Prefers going out around ${habit.timeSlot}:00`;
      case 'genre_preference':
        return `Strong preference for ${habit.genre} events`;
      default:
        return 'Recurring behavior pattern detected';
    }
  }

  getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  }

  // Public method to add contextual memory
  addContextualMemory(userId, memory) {
    const existingMemories = this.memoryStore.contextualMemories.get(userId) || [];
    existingMemories.push({
      ...memory,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 memories
    if (existingMemories.length > 50) {
      existingMemories.shift();
    }
    
    this.memoryStore.contextualMemories.set(userId, existingMemories);
  }

  // Public method to get user profile
  getUserProfile(userId) {
    return this.memoryStore.userProfiles.get(userId);
  }

  // Public method to reset user data (for testing)
  resetUserData(userId) {
    this.memoryStore.userProfiles.delete(userId);
    this.memoryStore.behaviorPatterns.delete(userId);
    this.memoryStore.contextualMemories.delete(userId);
    this.memoryStore.feedbackHistory.delete(userId);
  }
}