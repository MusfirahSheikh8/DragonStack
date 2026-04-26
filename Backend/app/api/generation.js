const {Router} = require('express');

const router = new Router();

router.get('/' , (req, res) => {
    const generation = req.app.locals.engine.generation;
    if (!generation) {
        return res.status(503).json({ error: 'Generation engine not ready. Please try again shortly.' });
    }

    res.json({
        generation: {
            expiration: generation.expiration,
            generationId: generation.generationId || null
        }
    })
});

// Manual recovery endpoint to force a new generation
router.post('/force-new', (req, res) => {
    const engine = req.app.locals.engine;
    
    console.log('🔄 Manual generation refresh requested');
    
    // Stop current timer if running
    if (engine.timer) {
        clearTimeout(engine.timer);
        engine.timer = null;
    }
    
    // Force create a new generation
    engine.buildNewGeneration();
    
    res.json({
        success: true,
        message: 'New generation creation initiated',
        timestamp: new Date().toISOString()
    });
});

// Stop the generation engine
router.post('/stop', (req, res) => {
    const engine = req.app.locals.engine;
    
    console.log('🛑 Stopping generation engine...');
    
    // Stop the engine
    engine.stop();
    
    res.json({
        success: true,
        message: 'Generation engine stopped',
        timestamp: new Date().toISOString()
    });
});

// Start the generation engine
router.post('/start', (req, res) => {
    const engine = req.app.locals.engine;
    
    console.log('▶️ Starting generation engine...');
    
    // Start the engine
    engine.start();
    
    res.json({
        success: true,
        message: 'Generation engine started',
        timestamp: new Date().toISOString()
    });
});

// Get engine status
router.get('/status', (req, res) => {
    const engine = req.app.locals.engine;
    
    const status = {
        isRunning: engine.timer !== null,
        hasGeneration: engine.generation !== null,
        generationCount: engine.generationCount || 0,
        currentGeneration: engine.generation ? {
            generationId: engine.generation.generationId,
            expiration: engine.generation.expiration,
            isExpired: engine.generation ? Date.now() > engine.generation.expiration : null
        } : null
    };
    
    res.json({
        success: true,
        status: status,
        timestamp: new Date().toISOString()
    });
});

module.exports= router