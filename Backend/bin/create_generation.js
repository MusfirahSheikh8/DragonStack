#!/usr/bin/env node

const GenerationEngine = require('../app/generation/engine');
const GenerationTable = require('../app/generation/table');

class GenerationManager {
    constructor() {
        this.engine = new GenerationEngine();
    }

    async createGeneration() {
        console.log('Creating new generation...');
        
        try {
            // Create a new generation
            const generation = new (require('../app/generation/index'))();
            
            // Store it in the database
            const { generationId } = await GenerationTable.storeGeneration(generation);
            generation.generationId = generationId;
            
            console.log('✅ Generation created successfully!');
            console.log(`📋 Generation ID: ${generationId}`);
            console.log(`⏰ Expiration: ${generation.expiration}`);
            console.log(`🕐 Expires in: ${Math.round((generation.expiration.getTime() - Date.now()) / 1000)} seconds`);
            
            return generation;
        } catch (error) {
            console.error('❌ Error creating generation:', error);
            throw error;
        }
    }

    async listGenerations() {
        console.log('📋 Listing all generations...');
        
        try {
            const pool = require('../databasePool');
            const result = await new Promise((resolve, reject) => {
                pool.query(
                    'SELECT id, expiration, created_at FROM generation ORDER BY id DESC LIMIT 10',
                    (error, response) => {
                        if (error) return reject(error);
                        resolve(response.rows);
                    }
                );
            });

            if (result.length === 0) {
                console.log('📭 No generations found.');
                return;
            }

            console.log('\n📊 Recent Generations:');
            console.log('─'.repeat(60));
            result.forEach(gen => {
                const isExpired = new Date(gen.expiration) < new Date();
                const status = isExpired ? '❌ EXPIRED' : '✅ ACTIVE';
                console.log(`ID: ${gen.id} | ${status} | Expires: ${gen.expiration}`);
            });
            console.log('─'.repeat(60));
            
        } catch (error) {
            console.error('❌ Error listing generations:', error);
            throw error;
        }
    }

    async getCurrentGeneration() {
        console.log('🔍 Getting current generation info...');
        
        try {
            const pool = require('../databasePool');
            const result = await new Promise((resolve, reject) => {
                pool.query(
                    'SELECT id, expiration FROM generation WHERE expiration > NOW() ORDER BY id DESC LIMIT 1',
                    (error, response) => {
                        if (error) return reject(error);
                        resolve(response.rows[0]);
                    }
                );
            });

            if (!result) {
                console.log('📭 No active generation found.');
                return null;
            }

            const timeLeft = Math.round((new Date(result.expiration).getTime() - Date.now()) / 1000);
            console.log('✅ Current Active Generation:');
            console.log(`📋 Generation ID: ${result.id}`);
            console.log(`⏰ Expiration: ${result.expiration}`);
            console.log(`🕐 Time left: ${timeLeft} seconds`);
            
            return result;
        } catch (error) {
            console.error('❌ Error getting current generation:', error);
            throw error;
        }
    }
}

// CLI Interface
async function main() {
    const manager = new GenerationManager();
    const command = process.argv[2];

    try {
        switch (command) {
            case 'create':
                await manager.createGeneration();
                break;
            case 'list':
                await manager.listGenerations();
                break;
            case 'current':
                await manager.getCurrentGeneration();
                break;
            case 'help':
            default:
                console.log('🐉 Dragon Generation Manager');
                console.log('────────────────────────────');
                console.log('Usage: node bin/create_generation.js <command>');
                console.log('');
                console.log('Commands:');
                console.log('  create  - Create a new generation');
                console.log('  list    - List recent generations');
                console.log('  current - Show current active generation');
                console.log('  help    - Show this help message');
                console.log('');
                console.log('Examples:');
                console.log('  node bin/create_generation.js create');
                console.log('  node bin/create_generation.js list');
                console.log('  node bin/create_generation.js current');
                break;
        }
    } catch (error) {
        console.error('💥 Command failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = GenerationManager;

