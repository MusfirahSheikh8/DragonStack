const pool = require ('../../databasePool');
const DragonTable = require ('./table')
const Dragon = require ('./index');
const { response } = require('express');

const getDragonWithTraits = ({ dragonId }) => {
  return Promise.all([
    DragonTable.getDragon({ dragonId }),
    new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT 
          "traitType",
          "traitValue"
        FROM trait
        INNER JOIN "dragonTrait" 
          ON trait.id = "dragonTrait"."traitId"
        WHERE "dragonTrait"."dragonId" = $1
        `,
        [dragonId],
        (error, response) => {
          if (error) return reject(error);
          resolve(response.rows);
        }
      );
    })
  ])
  .then(([dragon, dragonTraits]) => ({
    ...dragon, dragonId , traits: dragonTraits
    
  }))
  .catch(error => {
    console.error('Error fetching dragon with traits:', error);
    throw error;
  });
};

const getPublicDragons = () => {
  return new Promise ((resolve, reject) => {
    pool.query(
      'SELECT id FROM dragon WHERE  "isPublic" = TRUE',
      (error, response) => {
        if (error) return reject (error);

        const publicDragonRows= response.rows;

        Promise.all(
          publicDragonRows.map(
            ({ id }) => getDragonWithTraits({ dragonId : id })
          )
        ).then (dragons => resolve({ dragons }))
          .catch( error => reject (error))
      }
    )
  })
}
// getDragonWithTraits({ dragonId: 1 })
//     .then(dragon => console.log('dragon', dragon))
//     .catch(error => console.error('error', error))

module.exports = { getDragonWithTraits, getPublicDragons };

