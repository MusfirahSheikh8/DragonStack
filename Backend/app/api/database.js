const { Router } = require('express');
const pool = require('../../databasePool');

const router = new Router();

// GET /database/test - Test database connection and tables
router.get('/test', async (req, res) => {
    const testResults = {
        timestamp: new Date().toISOString(),
        tests: [],
        overallStatus: 'unknown',
        summary: {}
    };

    try {
        // Test 1: Basic connection
        const connectionTest = await testConnection();
        testResults.tests.push(connectionTest);

        // Test 2: Check if generation table exists
        const generationTableTest = await testGenerationTable();
        testResults.tests.push(generationTableTest);

        // Test 3: Check if dragon table exists
        const dragonTableTest = await testDragonTable();
        testResults.tests.push(dragonTableTest);

        // Test 4: Check if trait table exists
        const traitTableTest = await testTraitTable();
        testResults.tests.push(traitTableTest);

        // Test 5: Test insert/select operations
        const insertTest = await testInsertSelect();
        testResults.tests.push(insertTest);

        // Calculate overall status
        const passedTests = testResults.tests.filter(test => test.status === 'passed').length;
        const totalTests = testResults.tests.length;
        
        testResults.overallStatus = passedTests === totalTests ? 'healthy' : 'issues';
        testResults.summary = {
            total: totalTests,
            passed: passedTests,
            failed: totalTests - passedTests,
            healthPercentage: Math.round((passedTests / totalTests) * 100)
        };

        res.json({
            success: true,
            message: 'Database test completed',
            results: testResults
        });

    } catch (error) {
        testResults.overallStatus = 'failed';
        testResults.error = error.message;

        res.status(500).json({
            success: false,
            message: 'Database test failed',
            error: error.message,
            results: testResults
        });
    }
});

// Helper function to test basic connection
async function testConnection() {
    const startTime = Date.now();
    
    try {
        const result = await pool.query('SELECT NOW() as current_time, version() as version');
        const duration = Date.now() - startTime;
        
        return {
            name: 'Basic Connection',
            status: 'passed',
            duration: `${duration}ms`,
            details: {
                currentTime: result.rows[0].current_time,
                version: result.rows[0].version,
                responseTime: duration
            }
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        
        return {
            name: 'Basic Connection',
            status: 'failed',
            error: error.message,
            duration: `${duration}ms`,
            details: {
                code: error.code,
                severity: error.severity,
                hint: error.hint,
                position: error.position
            }
        };
    }
}

// Helper function to test generation table
async function testGenerationTable() {
    try {
        const result = await pool.query('SELECT COUNT(*) as count FROM generation');
        
        return {
            name: 'Generation Table',
            status: 'passed',
            details: {
                recordCount: parseInt(result.rows[0].count),
                tableExists: true
            }
        };
    } catch (error) {
        return {
            name: 'Generation Table',
            status: 'failed',
            error: error.message,
            details: {
                tableExists: false,
                suggestion: 'Run: npm run configure'
            }
        };
    }
}

// Helper function to test dragon table
async function testDragonTable() {
    try {
        const result = await pool.query('SELECT COUNT(*) as count FROM dragon');
        
        return {
            name: 'Dragon Table',
            status: 'passed',
            details: {
                recordCount: parseInt(result.rows[0].count),
                tableExists: true
            }
        };
    } catch (error) {
        return {
            name: 'Dragon Table',
            status: 'failed',
            error: error.message,
            details: {
                tableExists: false,
                suggestion: 'Run: npm run configure'
            }
        };
    }
}

// Helper function to test trait table
async function testTraitTable() {
    try {
        const result = await pool.query('SELECT COUNT(*) as count FROM trait');
        
        return {
            name: 'Trait Table',
            status: 'passed',
            details: {
                recordCount: parseInt(result.rows[0].count),
                tableExists: true
            }
        };
    } catch (error) {
        return {
            name: 'Trait Table',
            status: 'failed',
            error: error.message,
            details: {
                tableExists: false,
                suggestion: 'Trait table missing - this will cause dragon creation to fail'
            }
        };
    }
}

// Helper function to test insert/select operations
async function testInsertSelect() {
    const startTime = Date.now();
    
    try {
        // Test insert
        const testData = {
            expiration: new Date(Date.now() + 60000) // 1 minute from now
        };
        
        const insertResult = await pool.query(
            'INSERT INTO generation(expiration) VALUES ($1) RETURNING id',
            [testData.expiration]
        );
        
        const insertedId = insertResult.rows[0].id;
        
        // Test select
        const selectResult = await pool.query(
            'SELECT * FROM generation WHERE id = $1',
            [insertedId]
        );
        
        // Clean up test data
        await pool.query('DELETE FROM generation WHERE id = $1', [insertedId]);
        
        const duration = Date.now() - startTime;
        
        return {
            name: 'Insert/Select Operations',
            status: 'passed',
            duration: `${duration}ms`,
            details: {
                insertedId: insertedId,
                retrievedRecord: selectResult.rows[0],
                operationsTested: ['insert', 'select', 'delete']
            }
        };
    } catch (error) {
        return {
            name: 'Insert/Select Operations',
            status: 'failed',
            error: error.message,
            details: {
                operation: 'insert/select test failed'
            }
        };
    }
}

// GET /database/status - Quick status check
router.get('/status', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        
        res.json({
            success: true,
            status: 'connected',
            timestamp: result.rows[0].current_time,
            message: 'Database connection is healthy'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'disconnected',
            error: error.message,
            message: 'Database connection failed'
        });
    }
});

// GET /database/simple-test - Very basic connection test
router.get('/simple-test', async (req, res) => {
    const { Pool } = require('pg');
    const databaseConfiguration = require('../../secrets/databaseConfiguration');
    
    // Create a new connection (not using the pool)
    const testPool = new Pool(databaseConfiguration);
    
    try {
        const result = await testPool.query('SELECT 1 as test');
        await testPool.end(); // Close the test connection
        
        res.json({
            success: true,
            message: 'Simple database test passed',
            result: result.rows[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        try {
            await testPool.end();
        } catch (endError) {
            // Ignore end errors
        }
        
        res.status(500).json({
            success: false,
            message: 'Simple database test failed',
            error: error.message,
            code: error.code,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /database/tables - List all tables
router.get('/tables', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        res.json({
            success: true,
            tables: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
