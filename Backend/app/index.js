const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const GenerationEngine = require('./generation/engine');
const dragonRouter = require('./api/dragon');
const generationRouter = require('./api/generation');
const databaseRouter = require('./api/database');
const accountRouter = require('./api/account')

const app = express();
const engine = new GenerationEngine();

app.locals.engine = engine;
engine.start();            

app.use(cors({ origin : 'http://localhost:1234', credentials: true}));
app.use(bodyParser.json())
app.use(cookieParser());


app.use('/account', accountRouter)
app.use('/dragon', dragonRouter);
app.use('/generation', generationRouter);
app.use('/database', databaseRouter);

app.use(( err, req, res, next ) => {
    console.error("🔥 ERROR:", err);
    const statusCode = err.status || 500

    res.status(statusCode).json({
        type: 'error' , message: err.message || 'Internal server error'
    })
})

module.exports = app;


