const Dragon = require('../dragon');
const { REFRESH_RATE, SECONDS } = require('../config');

const refreshRate = REFRESH_RATE * SECONDS;

class Generation {
  constructor() {
    this.accountIds =new Set();
    this.createdAt = new Date();
    this.expiration = this.calculateExpiration();
    this.generationId = undefined;
  }

  calculateExpiration() {
    // Fixed logic: Generate expiration between 2.5-7.5 seconds
    const minDuration = refreshRate * 0.5; // 2.5 seconds
    const maxDuration = refreshRate * 1.5; // 7.5 seconds
    const randomDuration = minDuration + Math.random() * (maxDuration - minDuration);
    
    return new Date(Date.now() + randomDuration);
  }

  newDragon({ accountId }) {
    const now = new Date();
    
    if (now > this.expiration) {
      throw new Error(`This generation is expired on ${this.expiration}`);
    }

    if (this.accountIds.has(accountId)) {
      throw new Error ('You already have a dragon from this generation')
    }

    this.accountIds.add(accountId);

    return new Dragon({ generationId: this.generationId });
  }
}

module.exports = Generation