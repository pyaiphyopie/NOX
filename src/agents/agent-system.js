// NOX Agent System - Core Architecture
// Specialized intelligence agents with domain authority

export class AgentSystem {
  constructor() {
    this.agents = new Map();
    this.priorityOrder = ['safety', 'context', 'discovery', 'momentum', 'vibe', 'memory'];
  }

  registerAgent(name, agent) {
    this.agents.set(name, agent);
  }

  async execute(input) {
    const results = new Map();
    
    // Execute agents in priority order
    for (const agentName of this.priorityOrder) {
      const agent = this.agents.get(agentName);
      if (agent) {
        try {
          const result = await agent.process(input);
          results.set(agentName, result);
          
          // Safety agent can override
          if (agentName === 'safety' && result.shouldOverride) {
            return this.buildResponse(results, true);
          }
        } catch (error) {
          console.error(`Agent ${agentName} failed:`, error);
        }
      }
    }
    
    return this.buildResponse(results, false);
  }

  buildResponse(results, overridden) {
    return {
      results: Object.fromEntries(results),
      overridden,
      timestamp: new Date().toISOString()
    };
  }
}

export class BaseAgent {
  constructor(config) {
    this.name = config.name;
    this.skills = config.skills || [];
    this.inputs = config.inputs || [];
    this.priority = config.priority || 0;
  }

  async process(input) {
    throw new Error('Process method must be implemented by subclass');
  }

  validateInput(input) {
    return this.inputs.every(required => input[required] !== undefined);
  }
}