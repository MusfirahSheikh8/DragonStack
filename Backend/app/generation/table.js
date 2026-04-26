const { response } = require('express');
const pool = require('../../databasePool');

class GenerationTable  {
   static storeGeneration(generation) {
    return new Promise((resolve, reject) => {
        pool.query(
            'INSERT INTO generation(expiration) VALUES ($1) RETURNING id',
            [generation.expiration] , 
            (error, response) => {
                if(error) {
                    return reject(error);
                }

                if (!response || !response.rows || response.rows.length === 0) {
                    return reject(new Error('No rows returned from database insert'));
                }

                const generationId = response.rows[0].id;
                resolve({generationId});
            }
        )
    })
    }
}

module.exports= GenerationTable