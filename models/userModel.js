const db = require('./db');

async function getUsers(search) {
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length} OR CAST(id AS TEXT) ILIKE $${params.length})`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT id, name, email, phone, role, status, joined_date, last_login FROM users ${whereClause} ORDER BY joined_date DESC LIMIT 100;`;
  const { rows } = await db.query(query, params);
  return rows;
}

async function createUser({ name, email, phone, role }) {
  const query = `
    INSERT INTO users (name, email, phone, role, status, joined_date, last_login)
    VALUES ($1, $2, $3, $4, 'active', CURRENT_DATE, NOW())
    RETURNING id, name, email, phone, role, status, joined_date, last_login;
  `;
  const values = [name, email, phone, role || 'viewer'];
  const { rows } = await db.query(query, values);
  return rows[0];
}

module.exports = {
  getUsers,
  createUser
};
