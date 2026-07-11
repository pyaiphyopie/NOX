class PreferenceService {
  constructor() {
    this.storageKey = 'nox_user_preferences';
    this.defaultPreferences = {
      preferredGenres: [],
      dislikedGenres: [],
      preferredVenues: [],
      dislikedVenues: [],
      preferredAreas: [],
      dislikedAreas: [],
      densityPreference: 'medium', // low, medium, high
      timePreference: 'evening', // early_evening, evening, late_night
      budgetRange: { min: 0, max: 50 },
      socialPreference: 'mixed', // solo, small_group, mixed, large_group
      musicIntensity: 'moderate', // low, moderate, high
      transportationMode: 'mixed', // walking, taxi, ride_share, mixed
      notificationPreferences: {
        eventReminders: true,
        priceDrops: true,
        newEventsInPreferences: true,
        friendActivity: false
      },
      accessibilityNeeds: [],
      language: 'en'
    };
  }

  // Get user preferences
  getPreferences() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return { ...this.defaultPreferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
    return { ...this.defaultPreferences };
  }

  // Save user preferences
  savePreferences(preferences) {
    try {
      const currentPrefs = this.getPreferences();
      const updatedPrefs = { ...currentPrefs, ...preferences };
      localStorage.setItem(this.storageKey, JSON.stringify(updatedPrefs));
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }

  // Update specific preference
  updatePreference(key, value) {
    const preferences = this.getPreferences();
    preferences[key] = value;
    return this.savePreferences(preferences);
  }

  // Add to preferred list
  addToPreferred(category, item) {
    const preferences = this.getPreferences();
    const key = `preferred${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    if (!preferences[key]) {
      preferences[key] = [];
    }
    
    if (!preferences[key].includes(item)) {
      preferences[key].push(item);
      return this.savePreferences(preferences);
    }
    return true;
  }

  // Remove from preferred list
  removeFromPreferred(category, item) {
    const preferences = this.getPreferences();
    const key = `preferred${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    if (preferences[key]) {
      preferences[key] = preferences[key].filter(i => i !== item);
      return this.savePreferences(preferences);
    }
    return true;
  }

  // Add to disliked list
  addToDisliked(category, item) {
    const preferences = this.getPreferences();
    const key = `disliked${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    if (!preferences[key]) {
      preferences[key] = [];
    }
    
    if (!preferences[key].includes(item)) {
      preferences[key].push(item);
      return this.savePreferences(preferences);
    }
    return true;
  }

  // Remove from disliked list
  removeFromDisliked(category, item) {
    const preferences = this.getPreferences();
    const key = `disliked${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    if (preferences[key]) {
      preferences[key] = preferences[key].filter(i => i !== item);
      return this.savePreferences(preferences);
    }
    return true;
  }

  // Toggle preference (add if not present, remove if present)
  togglePreference(category, item, type = 'preferred') {
    const preferences = this.getPreferences();
    const key = `${type}${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    if (!preferences[key]) {
      preferences[key] = [];
    }
    
    if (preferences[key].includes(item)) {
      preferences[key] = preferences[key].filter(i => i !== item);
    } else {
      preferences[key].push(item);
    }
    
    return this.savePreferences(preferences);
  }

  // Reset preferences to default
  resetPreferences() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.defaultPreferences));
      return true;
    } catch (error) {
      console.error('Error resetting preferences:', error);
      return false;
    }
  }

  // Clear all preferences
  clearPreferences() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Error clearing preferences:', error);
      return false;
    }
  }

  // Export preferences
  exportPreferences() {
    const preferences = this.getPreferences();
    return JSON.stringify(preferences, null, 2);
  }

  // Import preferences
  importPreferences(preferencesString) {
    try {
      const preferences = JSON.parse(preferencesString);
      return this.savePreferences(preferences);
    } catch (error) {
      console.error('Error importing preferences:', error);
      return false;
    }
  }

  // Get preference compatibility score with an event
  getEventCompatibility(event) {
    const preferences = this.getPreferences();
    let score = 0;
    const maxScore = 10;

    // Genre compatibility
    if (preferences.preferredGenres.includes(event.category)) {
      score += 3;
    } else if (preferences.dislikedGenres.includes(event.category)) {
      score -= 2;
    }

    // Venue compatibility
    if (preferences.preferredVenues.includes(event.venue)) {
      score += 2;
    } else if (preferences.dislikedVenues.includes(event.venue)) {
      score -= 1;
    }

    // Area compatibility
    if (preferences.preferredAreas.includes(event.location)) {
      score += 2;
    } else if (preferences.dislikedAreas.includes(event.location)) {
      score -= 1;
    }

    // Budget compatibility
    if (event.price >= preferences.budgetRange.min && event.price <= preferences.budgetRange.max) {
      score += 2;
    } else if (event.price > preferences.budgetRange.max) {
      score -= 1;
    }

    // Time compatibility
    const eventHour = this.extractEventHour(event.time);
    const preferredHours = this.getPreferredHours(preferences.timePreference);
    if (preferredHours.includes(eventHour)) {
      score += 1;
    }

    return Math.max(0, Math.min(maxScore, score));
  }

  // Get recommended events based on preferences
  getRecommendedEvents(events, limit = 10) {
    const preferences = this.getPreferences();
    
    return events
      .map(event => ({
        ...event,
        compatibilityScore: this.getEventCompatibility(event)
      }))
      .filter(event => {
        // Filter out strongly disliked items
        if (preferences.dislikedGenres.includes(event.category)) return false;
        if (preferences.dislikedVenues.includes(event.venue)) return false;
        if (preferences.dislikedAreas.includes(event.location)) return false;
        return true;
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit);
  }

  // Get personalization insights
  getPersonalizationInsights() {
    const preferences = this.getPreferences();
    const insights = [];

    if (preferences.preferredGenres.length > 0) {
      insights.push({
        type: 'genre',
        message: `You prefer ${preferences.preferredGenres.join(', ')} events`,
        strength: preferences.preferredGenres.length
      });
    }

    if (preferences.preferredVenues.length > 0) {
      insights.push({
        type: 'venue',
        message: `Favorite venues: ${preferences.preferredVenues.join(', ')}`,
        strength: preferences.preferredVenues.length
      });
    }

    if (preferences.preferredAreas.length > 0) {
      insights.push({
        type: 'area',
        message: `Preferred areas: ${preferences.preferredAreas.join(', ')}`,
        strength: preferences.preferredAreas.length
      });
    }

    if (preferences.budgetRange.max > 0) {
      insights.push({
        type: 'budget',
        message: `Budget range: $${preferences.budgetRange.min} - $${preferences.budgetRange.max}`,
        strength: 1
      });
    }

    return insights;
  }

  // Helper method to extract hour from time string
  extractEventHour(timeString) {
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1]);
      const period = match[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return hours;
    }
    return 21; // Default to 9 PM
  }

  // Helper method to get preferred hours based on time preference
  getPreferredHours(timePreference) {
    const hourMap = {
      'early_evening': [18, 19, 20],
      'evening': [20, 21, 22, 23],
      'late_night': [22, 23, 0, 1, 2]
    };
    return hourMap[timePreference] || hourMap['evening'];
  }

  // Validate preferences
  validatePreferences(preferences) {
    const errors = [];

    if (preferences.budgetRange && preferences.budgetRange.min < 0) {
      errors.push('Minimum budget cannot be negative');
    }

    if (preferences.budgetRange && preferences.budgetRange.max < preferences.budgetRange.min) {
      errors.push('Maximum budget must be greater than minimum budget');
    }

    if (preferences.preferredGenres && !Array.isArray(preferences.preferredGenres)) {
      errors.push('Preferred genres must be an array');
    }

    return errors;
  }

  // Get preference statistics
  getPreferenceStats() {
    const preferences = this.getPreferences();
    return {
      totalPreferences: 
        preferences.preferredGenres.length +
        preferences.preferredVenues.length +
        preferences.preferredAreas.length,
      totalDislikes:
        preferences.dislikedGenres.length +
        preferences.dislikedVenues.length +
        preferences.dislikedAreas.length,
      hasBudgetSet: preferences.budgetRange.max > 0,
      hasTimePreference: preferences.timePreference !== 'evening',
      hasSocialPreference: preferences.socialPreference !== 'mixed',
      notificationEnabled: Object.values(preferences.notificationPreferences).filter(Boolean).length
    };
  }
}

// Singleton instance
export const preferenceService = new PreferenceService();