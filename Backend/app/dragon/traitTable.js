const pool = require('../../databasePool');

/**
 * Handles interactions with the 'trait' table, mapping trait type/value strings to database IDs.
 */
class TraitTable {
    // Fetches the 'id' for a specific traitType and traitValue combination
    static getTraitId({ traitType, traitValue }) {
        return new Promise((resolve, reject) => {
            pool.query(
                // Note: PostgreSQL column names like "traitType" require double quotes if they were created with mixed case.
                'SELECT id FROM trait WHERE "traitType" = $1 AND "traitValue" = $2',
                [traitType, traitValue],
                (error, response) => {
                    if (error) return reject(error);
                    
                    if (response.rows.length === 0) {
                        // This indicates the trait pair doesn't exist in the trait table.
                        // You must ensure your trait data from traits.json is pre-loaded into the 'trait' table.
                        return reject(new Error(`Trait not found in database: ${traitType} - ${traitValue}. Ensure traits are seeded.`));
                    }

                    const traitId = response.rows[0].id;
                    resolve({ traitId });
                }
            )
        });
    }
}

module.exports = TraitTable;
