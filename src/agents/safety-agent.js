import { BaseAgent } from './agent-system';

export class SafetyAgent extends BaseAgent {
  constructor() {
    super({
      name: 'safety',
      skills: [
        'unsafe_area_detection',
        'overcrowding_detection',
        'suspicious_pattern_analysis',
        'transport_risk_estimation',
        'emergency_signal_monitoring',
        'venue_incident_tracking',
        'weather_risk_analysis'
      ],
      inputs: ['location_data', 'crowd_density', 'incident_reports', 'weather_conditions', 'transport_status'],
      priority: 1 // Highest priority - can override all recommendations
    });
  }

  async process(input) {
    if (!this.validateInput(input)) {
      throw new Error('Invalid input for SafetyAgent');
    }

    const { location_data, crowd_density, incident_reports, weather_conditions, transport_status } = input;

    // Detect unsafe areas
    const unsafeAreas = this.detectUnsafeAreas(location_data, incident_reports);
    
    // Detect overcrowding risks
    const overcrowdingRisks = this.detectOvercrowding(crowd_density);
    
    // Analyze suspicious patterns
    const suspiciousPatterns = this.analyzeSuspiciousPatterns(location_data, incident_reports);
    
    // Estimate transport risks
    const transportRisks = this.estimateTransportRisks(transport_status, weather_conditions);
    
    // Monitor emergency signals
    const emergencySignals = this.monitorEmergencySignals(incident_reports);
    
    // Track venue incidents
    const venueIncidents = this.trackVenueIncidents(incident_reports);
    
    // Analyze weather risks
    const weatherRisks = this.analyzeWeatherRisks(weather_conditions);

    // Determine if safety override is needed
    const safetyAssessment = this.assessSafetyLevel({
      unsafeAreas,
      overcrowdingRisks,
      suspiciousPatterns,
      transportRisks,
      emergencySignals,
      venueIncidents,
      weatherRisks
    });

    return {
      unsafeAreas,
      overcrowdingRisks,
      suspiciousPatterns,
      transportRisks,
      emergencySignals,
      venueIncidents,
      weatherRisks,
      safetyAssessment,
      shouldOverride: safetyAssessment.level === 'critical',
      recommendations: this.generateRecommendations(safetyAssessment),
      timestamp: new Date().toISOString()
    };
  }

  detectUnsafeAreas(locationData, incidentReports) {
    const unsafeAreas = [];
    
    Object.keys(locationData).forEach(areaId => {
      const area = locationData[areaId];
      const incidents = incidentReports.filter(r => r.areaId === areaId);
      
      // High incident rate
      if (incidents.length > 5) {
        unsafeAreas.push({
          areaId,
          riskLevel: 'high',
          reason: `${incidents.length} recent incidents`,
          incidentTypes: incidents.map(i => i.type)
        });
      }
      
      // Low lighting or poor infrastructure
      if (area.safetyScore < 0.4) {
        unsafeAreas.push({
          areaId,
          riskLevel: 'medium',
          reason: 'Poor safety infrastructure',
          factors: ['lighting', 'surveillance', 'police_presence'].filter(f => area[f] === 'poor')
        });
      }
    });
    
    return unsafeAreas;
  }

  detectOvercrowding(crowdDensity) {
    const risks = [];
    
    Object.keys(crowdDensity).forEach(venueId => {
      const density = crowdDensity[venueId];
      const occupancyRatio = density.current / density.capacity;
      
      if (occupancyRatio > 1.2) {
        risks.push({
          venueId,
          riskLevel: 'critical',
          occupancyRatio,
          message: 'Severely overcrowded - exceeds capacity by 20%+'
        });
      } else if (occupancyRatio > 1.0) {
        risks.push({
          venueId,
          riskLevel: 'high',
          occupancyRatio,
          message: 'Over capacity'
        });
      } else if (occupancyRatio > 0.9) {
        risks.push({
          venueId,
          riskLevel: 'medium',
          occupancyRatio,
          message: 'Near capacity - entry may be slow'
        });
      }
    });
    
    return risks;
  }

  analyzeSuspiciousPatterns(locationData, incidentReports) {
    const patterns = [];
    
    // Cluster analysis for unusual activity
    const recentIncidents = incidentReports.filter(i => 
      new Date(i.timestamp) > new Date(Date.now() - 3600000) // Last hour
    );
    
    // Check for spatial clustering
    const incidentClusters = this.findIncidentClusters(recentIncidents);
    incidentClusters.forEach(cluster => {
      patterns.push({
        type: 'spatial_cluster',
        location: cluster.location,
        severity: cluster.incidents.length > 3 ? 'high' : 'medium',
        description: `${cluster.incidents.length} incidents in close proximity`
      });
    });
    
    // Check for temporal patterns
    const temporalPatterns = this.findTemporalPatterns(incidentReports);
    temporalPatterns.forEach(pattern => {
      patterns.push({
        type: 'temporal_pattern',
        pattern: pattern.description,
        severity: 'medium',
        description: 'Recurring incident pattern detected'
      });
    });
    
    return patterns;
  }

  estimateTransportRisks(transportStatus, weatherConditions) {
    const risks = [];
    
    Object.keys(transportStatus).forEach(routeId => {
      const route = transportStatus[routeId];
      
      // Weather impact
      if (weatherConditions.condition === 'rain' && route.type === 'outdoor') {
        risks.push({
          routeId,
          riskLevel: 'high',
          reason: 'Weather conditions affecting route',
          recommendation: 'Use alternative transport'
        });
      }
      
      // Congestion risks
      if (route.congestion > 0.8) {
        risks.push({
          routeId,
          riskLevel: 'medium',
          reason: 'High congestion',
          recommendation: 'Allow extra travel time'
        });
      }
      
      // Service disruptions
      if (route.status === 'disrupted') {
        risks.push({
          routeId,
          riskLevel: 'high',
          reason: 'Service disruption',
          recommendation: 'Find alternative route'
        });
      }
    });
    
    return risks;
  }

  monitorEmergencySignals(incidentReports) {
    const signals = [];
    
    // Check for emergency service activity
    const emergencyIncidents = incidentReports.filter(i => 
      i.type === 'medical' || i.type === 'fire' || i.type === 'police'
    );
    
    if (emergencyIncidents.length > 0) {
      signals.push({
        type: 'emergency_services',
        count: emergencyIncidents.length,
        locations: emergencyIncidents.map(i => i.location),
        severity: emergencyIncidents.length > 2 ? 'high' : 'medium'
      });
    }
    
    // Check for crowd control incidents
    const crowdIncidents = incidentReports.filter(i => i.type === 'crowd_control');
    if (crowdIncidents.length > 0) {
      signals.push({
        type: 'crowd_control',
        count: crowdIncidents.length,
        severity: 'high',
        recommendation: 'Avoid affected areas'
      });
    }
    
    return signals;
  }

  trackVenueIncidents(incidentReports) {
    const venueIncidents = {};
    
    incidentReports.forEach(incident => {
      if (!venueIncidents[incident.venueId]) {
        venueIncidents[incident.venueId] = [];
      }
      venueIncidents[incident.venueId].push(incident);
    });
    
    // Convert to array with risk assessment
    return Object.keys(venueIncidents).map(venueId => {
      const incidents = venueIncidents[venueId];
      const severityScore = incidents.reduce((sum, i) => sum + (i.severity || 1), 0);
      
      return {
        venueId,
        incidentCount: incidents.length,
        severityScore,
        riskLevel: severityScore > 5 ? 'high' : severityScore > 2 ? 'medium' : 'low',
        recentIncidents: incidents.filter(i => 
          new Date(i.timestamp) > new Date(Date.now() - 7200000) // Last 2 hours
        )
      };
    });
  }

  analyzeWeatherRisks(weatherConditions) {
    const risks = [];
    
    if (weatherConditions.condition === 'storm') {
      risks.push({
        type: 'severe_weather',
        severity: 'critical',
        recommendation: 'Seek shelter, avoid outdoor venues'
      });
    } else if (weatherConditions.condition === 'rain') {
      risks.push({
        type: 'rain',
        severity: 'medium',
        recommendation: 'Outdoor venues may be affected'
      });
    }
    
    if (weatherConditions.temperature > 35) {
      risks.push({
        type: 'heat',
        severity: 'medium',
        recommendation: 'Stay hydrated, avoid prolonged outdoor exposure'
      });
    }
    
    if (weatherConditions.visibility < 0.5) {
      risks.push({
        type: 'poor_visibility',
        severity: 'high',
        recommendation: 'Extra caution when traveling'
      });
    }
    
    return risks;
  }

  assessSafetyLevel(assessment) {
    let riskScore = 0;
    
    // Count critical risks
    const criticalRisks = [
      ...assessment.overcrowdingRisks.filter(r => r.riskLevel === 'critical'),
      ...assessment.weatherRisks.filter(r => r.severity === 'critical'),
      ...assessment.emergencySignals.filter(s => s.severity === 'high')
    ];
    
    riskScore += criticalRisks.length * 3;
    
    // Count high risks
    const highRisks = [
      ...assessment.unsafeAreas.filter(a => a.riskLevel === 'high'),
      ...assessment.overcrowdingRisks.filter(r => r.riskLevel === 'high'),
      ...assessment.transportRisks.filter(r => r.riskLevel === 'high'),
      ...assessment.venueIncidents.filter(v => v.riskLevel === 'high')
    ];
    
    riskScore += highRisks.length * 2;
    
    // Count medium risks
    const mediumRisks = [
      ...assessment.unsafeAreas.filter(a => a.riskLevel === 'medium'),
      ...assessment.overcrowdingRisks.filter(r => r.riskLevel === 'medium'),
      ...assessment.suspiciousPatterns.filter(p => p.severity === 'medium')
    ];
    
    riskScore += mediumRisks.length;
    
    // Determine overall safety level
    if (riskScore >= 5) {
      return { level: 'critical', score: riskScore };
    } else if (riskScore >= 3) {
      return { level: 'high', score: riskScore };
    } else if (riskScore >= 1) {
      return { level: 'medium', score: riskScore };
    }
    
    return { level: 'low', score: 0 };
  }

  generateRecommendations(safetyAssessment) {
    const recommendations = [];
    
    if (safetyAssessment.level === 'critical') {
      recommendations.push({
        priority: 'immediate',
        action: 'Avoid recommended venues',
        reason: 'Critical safety risks detected'
      });
      recommendations.push({
        priority: 'immediate',
        action: 'Consider returning home',
        reason: 'Unsafe conditions in area'
      });
    } else if (safetyAssessment.level === 'high') {
      recommendations.push({
        priority: 'high',
        action: 'Exercise extreme caution',
        reason: 'Multiple safety risks detected'
      });
      recommendations.push({
        priority: 'high',
        action: 'Stay in well-lit, populated areas',
        reason: 'Risk factors present'
      });
    } else if (safetyAssessment.level === 'medium') {
      recommendations.push({
        priority: 'medium',
        action: 'Be aware of surroundings',
        reason: 'Some safety concerns detected'
      });
    }
    
    return recommendations;
  }

  findIncidentClusters(incidents) {
    // Simple clustering algorithm - in production would use proper spatial clustering
    const clusters = [];
    const processed = new Set();
    
    incidents.forEach((incident, i) => {
      if (processed.has(i)) return;
      
      const cluster = {
        location: incident.location,
        incidents: [incident]
      };
      
      incidents.forEach((other, j) => {
        if (i !== j && !processed.has(j)) {
          const distance = this.calculateDistance(incident.location, other.location);
          if (distance < 0.5) { // Within 0.5km
            cluster.incidents.push(other);
            processed.add(j);
          }
        }
      });
      
      if (cluster.incidents.length > 1) {
        clusters.push(cluster);
      }
      
      processed.add(i);
    });
    
    return clusters;
  }

  findTemporalPatterns(incidents) {
    // Analyze time-based patterns
    const patterns = [];
    const hourCounts = {};
    
    incidents.forEach(incident => {
      const hour = new Date(incident.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    Object.keys(hourCounts).forEach(hour => {
      if (hourCounts[hour] > 3) {
        patterns.push({
          description: `High incident rate at ${hour}:00`,
          hour: parseInt(hour),
          count: hourCounts[hour]
        });
      }
    });
    
    return patterns;
  }

  calculateDistance(loc1, loc2) {
    // Simple distance calculation - in production would use proper geospatial calculation
    const dx = loc1.lat - loc2.lat;
    const dy = loc1.lng - loc2.lng;
    return Math.sqrt(dx * dx + dy * dy);
  }
}