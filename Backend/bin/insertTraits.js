const pool = require('../databasePool');
const TRAITS = require('../data/traits');

(async () => {
  for (const { type, values } of TRAITS) {
    for (const value of values) {
      try {
        // Try inserting first
        const insertResult = await pool.query(
          `
          INSERT INTO trait ("traitType", "traitValue")
          VALUES ($1, $2)
          ON CONFLICT ("traitType", "traitValue") DO NOTHING
          RETURNING id
          `,
          [type, value]
        );

        let traitId;

        if (insertResult.rows.length > 0) {
          // If a new trait was inserted, get its ID
          traitId = insertResult.rows[0].id;
          console.log(`✅ Inserted trait - id: ${traitId} (${type}: ${value})`);
        } else {
          // If duplicate, fetch its existing ID
          const selectResult = await pool.query(
            `SELECT id FROM trait WHERE "traitType" = $1 AND "traitValue" = $2`,
            [type, value]
          );

          traitId = selectResult.rows[0].id;
          console.log(`⚙️ Existing trait - id: ${traitId} (${type}: ${value})`);
        }

      } catch (err) {
        console.error(`❌ Error processing ${type}-${value}:`, err.message);
      }
    }
  }

  await pool.end();
  console.log('🟢 Done inserting and listing all trait IDs.');
})();

