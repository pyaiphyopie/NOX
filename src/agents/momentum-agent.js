import { BaseAgent } from './agent-system';

export class MomentumAgent extends BaseAgent {
  constructor() {
    super({
      name: 'momentum',
      skills: [
        'momentum_scoring',
        'signal_velocity_analysis',
        'real_time_ranking',
        'anomaly_detection',
        'popularity_forecasting',
        'attendance_projection',
        'queue_prediction'
      ],
      inputs: ['checkins', 'rsvp_growth', 'uploads', 'shares', 'occupancy', 'queue_times'],
      priority: 4
    });
  }

  async process(input) {
    if (!this.validateInput(input)) {
      throw new Error('Invalid input for MomentumAgent');
    }

    const { checkins, rsvp_growth, uploads, shares, occupancy, queue_times } = input;

    // Calculate momentum scores for venues/events
    const momentumScores = this.calculateMomentumScores(checkins, rsvp_growth, shares);
    
    // Analyze signal velocity (rate of change)
    const velocityAnalysis = this.analyzeVelocity(checkins, uploads, shares);
    
    // Detect anomalies in patterns
    const anomalies = this.detectAnomalies(occupancy, queue_times);
    
    // Project attendance based on trends
    const attendanceProjections = this.projectAttendance(checkins, rsvp_growth);
    
    // Predict queue times
    const queuePredictions = this.predictQueues(queue_times, occupancy);

    return {
      momentumScores,
      velocityAnalysis,
      anomalies,
      attendanceProjections,
      queuePredictions,
      timestamp: new Date().toISOString()
    };
  }

  calculateMomentumScores(checkins, rsvpGrowth, shares) {
    const scores = {};
    
    // Process each venue/event
    Object.keys(checkins).forEach(id => {
      const checkinData = checkins[id];
      const rsvpData = rsvpGrowth[id] || 0;
      const shareData = shares[id] || 0;
      
      // Base momentum from recent checkins
      let momentum = checkinData.recent * 0.4;
      
      // Growth component
      momentum += rsvpData * 0.3;
      
      // Social proof component
      momentum += shareData * 0.2;
      
      // Velocity component (rate of change)
      if (checkinData.velocity) {
        momentum += checkinData.velocity * 0.1;
      }
      
      scores[id] = Math.min(1, momentum);
    });
    
    return scores;
  }

  analyzeVelocity(checkins, uploads, shares) {
    const velocity = {};
    
    Object.keys(checkins).forEach(id => {
      const checkinData = checkins[id];
      const uploadData = uploads[id] || { recent: 0, previous: 0 };
      const shareData = shares[id] || { recent: 0, previous: 0 };
      
      // Calculate rate of change
      const checkinVelocity = this.calculateRateOfChange(
        checkinData.recent, 
        checkinData.previous || 0
      );
      
      const uploadVelocity = this.calculateRateOfChange(
        uploadData.recent, 
        uploadData.previous
      );
      
      const shareVelocity = this.calculateRateOfChange(
        shareData.recent, 
        shareData.previous
      );
      
      velocity[id] = {
        checkin: checkinVelocity,
        upload: uploadVelocity,
        share: shareVelocity,
        overall: (checkinVelocity + uploadVelocity + shareVelocity) / 3
      };
    });
    
    return velocity;
  }

  detectAnomalies(occupancy, queueTimes) {
    const anomalies = [];
    
    Object.keys(occupancy).forEach(id => {
      const occData = occupancy[id];
      const queueData = queueTimes[id] || {};
      
      // Detect sudden spikes
      if (occData.suddenSpike) {
        anomalies.push({
          type: 'occupancy_spike',
          id,
          severity: 'high',
          message: `Sudden occupancy spike detected at ${id}`
        });
      }
      
      // Detect unusual queue patterns
      if (queueData.unusualWait) {
        anomalies.push({
          type: 'queue_anomaly',
          id,
          severity: queueData.waitTime > 30 ? 'high' : 'medium',
          message: `Unusual queue time detected: ${queueData.waitTime} minutes`
        });
      }
    });
    
    return anomalies;
  }

  projectAttendance(checkins, rsvpGrowth) {
    const projections = {};
    
    Object.keys(checkins).forEach(id => {
      const checkinData = checkins[id];
      const rsvpData = rsvpGrowth[id] || 0;
      
      // Simple linear projection based on current trends
      const currentRate = checkinData.recent;
      const growthFactor = 1 + (rsvpData * 0.5);
      
      // Project for next 3 hours
      projections[id] = {
        nextHour: Math.round(checkinData.current * currentRate * growthFactor),
        next2Hours: Math.round(checkinData.current * currentRate * growthFactor * 1.2),
        next3Hours: Math.round(checkinData.current * currentRate * growthFactor * 1.4),
        confidence: this.calculateProjectionConfidence(checkinData, rsvpData)
      };
    });
    
    return projections;
  }

  predictQueues(queueTimes, occupancy) {
    const predictions = {};
    
    Object.keys(queueTimes).forEach(id => {
      const queueData = queueTimes[id];
      const occData = occupancy[id] || { current: 0, capacity: 100 };
      
      // Base prediction on historical patterns
      const baseTime = queueData.average || 15;
      
      // Adjust based on current occupancy
      const occupancyRatio = occData.current / occData.capacity;
      const occupancyMultiplier = 1 + (occupancyRatio * 2);
      
      // Adjust based on recent trend
      const trendMultiplier = queueData.trend === 'increasing' ? 1.3 : 
                             queueData.trend === 'decreasing' ? 0.7 : 1;
      
      predictions[id] = {
        estimatedWaitTime: Math.round(baseTime * occupancyMultiplier * trendMultiplier),
        trend: queueData.trend || 'stable',
        recommendation: this.getQueueRecommendation(baseTime * occupancyMultiplier * trendMultiplier)
      };
    });
    
    return predictions;
  }

  calculateRateOfChange(recent, previous) {
    if (previous === 0) return recent > 0 ? 1 : 0;
    return (recent - previous) / previous;
  }

  calculateProjectionConfidence(checkinData, rsvpData) {
    let confidence = 0.5;
    
    // More confidence with more data points
    if (checkinData.historyLength > 10) confidence += 0.2;
    
    // More confidence with consistent patterns
    if (checkinData.consistency > 0.8) confidence += 0.2;
    
    // More confidence with RSVP data
    if (rsvpData > 0) confidence += 0.1;
    
    return Math.min(1, confidence);
  }

  getQueueRecommendation(waitTime) {
    if (waitTime < 10) return 'Arrive now - minimal wait';
    if (waitTime < 20) return 'Acceptable wait time';
    if (waitTime < 30) return 'Consider arriving later';
    return 'High wait time - consider alternative venue';
  }
}