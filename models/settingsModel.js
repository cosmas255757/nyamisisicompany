const db = require('./db');

async function getSettings() {
  const query = `SELECT key, value FROM settings ORDER BY key;`;
  const { rows } = await db.query(query);
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

async function updateSettings(settings) {
  const connection = await db.connect();
  try {
    await connection.query('BEGIN');

    for (const [key, value] of Object.entries(settings)) {
      await connection.query(
        `INSERT INTO settings(key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
        [key, value]
      );
    }

    await connection.query('COMMIT');
  } catch (err) {
    await connection.query('ROLLBACK');
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  getSettings,
  updateSettings
};
