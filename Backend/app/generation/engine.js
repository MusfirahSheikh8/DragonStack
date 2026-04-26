const Generation = require('./index');
const GenerationTable = require('./table');

class GenerationEngine {
  constructor() {
    this.generation = null;
    this.timer = null;
    this.generationCount = 0;
  }

  start() {
    this.buildNewGeneration();
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  buildNewGeneration() {
    const generation = new Generation();
    this.generation = generation;
    this.generationCount++;

    GenerationTable.storeGeneration(generation)
      .then(({ generationId }) => {
        this.generation.generationId = generationId;
        this.setupGenerationTimer();
      })
      .catch(error => {
        // Fallback: Use generation without database storage
        this.generation.generationId = `fallback-${Date.now()}`;
        this.setupGenerationTimer();
      });
  }

  setupGenerationTimer() {
    // Calculate timer delay AFTER database operation completes (or fails)
    const now = Date.now();
    const msUntilExpiration = this.generation.expiration.getTime() - now;

    // Ensure we don't set a negative or very small timer
    const timerDelay = Math.max(msUntilExpiration, 100); // Minimum 100ms
    
    if (msUntilExpiration <= 0) {
      this.buildNewGeneration();
      return;
    }

    this.timer = setTimeout(() => {
      this.buildNewGeneration();
    }, timerDelay);
  }
}

module.exports = GenerationEngine;
