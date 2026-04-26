const { response } = require('express');
const pool = require('../../databasePool');
const TraitTable = require('./traitTable');

class DragonTable {
    static storeDragon(dragon) {
        const { birthdate, nickname, generationId, isPublic, saleValue, sireValue } = dragon;

        return new Promise((resolve, reject) => {
            // 1. Insert the main dragon record
            pool.query(
                `INSERT INTO dragon ( birthdate , nickname , "generationId", "isPublic", "saleValue", "sireValue" )
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                [birthdate, nickname, generationId, isPublic, saleValue, sireValue],
                (error, response) => {
                    if (error) return reject(error);

                    const dragonId = response.rows[0].id;

                    // 2. Store all generated traits using the returned dragonId
                    Promise.all(
                        dragon.traits.map(({ traitType, traitValue }) => {
                            // First, get the trait ID from the database
                            return TraitTable.getTraitId({ traitType, traitValue })
                                .then(({ traitId }) => {
                                    // Second, link the trait to the dragon
                                    // FIX: Explicitly calling DragonTable.storeDragonTrait for robustness
                                    return DragonTable.storeDragonTrait({ dragonId, traitId });
                                })
                        })
                    )
                        .then(() => resolve({ dragonId })) // Resolve the overall promise only after all traits are stored
                        .catch(error => {
                            console.error('Error storing dragon traits:', error);
                            // Log and reject on trait storage failure
                            reject(error);
                        });

                }
            )
        })
    }

    // Inserts a record into the junction table ("dragonTrait")
    static storeDragonTrait({ dragonId, traitId }) {
        return new Promise((resolve, reject) => {
            pool.query(
                'INSERT INTO "dragonTrait" ("traitId", "dragonId") VALUES ($1, $2)',
                [traitId, dragonId],
                (error, response) => {
                    if (error) return reject(error);
                    resolve();
                }
            );
        });
    }


    static getDragon({ dragonId }) {
        return new Promise((resolve, reject) => {
            pool.query(
                `
            SELECT birthdate, nickname, "generationId", "isPublic", "saleValue", "sireValue"
            FROM dragon
            WHERE dragon.id = $1
            `,
                [dragonId],
                (error, response) => {
                    if (error) return reject(error);

                    if (response.rows.length === 0)
                        return reject(new Error('No dragon found'));

                    resolve(response.rows[0]);
                }
            );
        });
    }
    
    static updateDragon({ dragonId, nickname, isPublic, saleValue, sireValue }) {
        const settingsMap = { nickname, isPublic, saleValue, sireValue };
        // Object.entries(settingsMap).forEach(([settingKey, settingValue]) => {
        //     console.log('settingKey', settingKey, 'settingValue', settingValue);
        // });
        const validEntries = Object.entries(settingsMap)
            .filter(([_, value]) => value !== undefined);

        if (validEntries.length === 0) {
            return Promise.resolve();
        }

        const queries = validEntries.map(([settingKey, settingValue]) => {
            console.log('settingKey', settingKey, 'settingValue', settingValue);

            return new Promise((resolve, reject) => {
                pool.query(
                    `UPDATE dragon SET "${settingKey}" = $1 WHERE id = $2`,
                    [settingValue, dragonId],
                    (error) => {
                        if (error) return reject(error);
                        resolve();
                    }
                );
            });
        });

        return Promise.all(queries);
    }


    // return new Promise (( resolve, reject ) => {
    //     pool.query(
    //         'UPDATE dragon SET nickname = $1, "isPublic" = $2, "saleValue" = $3 WHERE id = $4',
    //         [ nickname, isPublic, saleValue, dragonId ],
    //         (error, response) => {
    //             if (error) return reject (error);

    //             resolve();
    //         }
    //     )
    // });
}

module.exports = DragonTable;
