const db = require('./db');

async function getApplications(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.status && filters.status !== 'all') {
    params.push(filters.status.toLowerCase());
    conditions.push(`status = $${params.length}`);
  }

  if (filters.priority && filters.priority !== 'all') {
    params.push(filters.priority.toLowerCase());
    conditions.push(`priority = $${params.length}`);
  }

  if (filters.minAmount) {
    params.push(Number(filters.minAmount));
    conditions.push(`amount >= $${params.length}`);
  }

  if (filters.maxAmount) {
    params.push(Number(filters.maxAmount));
    conditions.push(`amount <= $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `
    SELECT a.id, a.borrower_id, a.amount, a.priority, a.status, a.credit_score, a.submitted_at,
      b.name AS borrower_name, b.email AS borrower_email, b.phone AS borrower_phone
    FROM applications a
    LEFT JOIN borrowers b ON b.id = a.borrower_id
    ${whereClause}
    ORDER BY a.submitted_at DESC
    LIMIT 100;
  `;

  const { rows } = await db.query(query, params);
  return rows.map((row) => ({
    applicationId: `APP${String(row.id).padStart(3, '0')}`,
    borrowerName: row.borrower_name,
    borrowerEmail: row.borrower_email,
    borrowerPhone: row.borrower_phone,
    amount: Number(row.amount),
    priority: row.priority,
    status: row.status,
    creditScore: row.credit_score,
    submittedAt: row.submitted_at
  }));
}

async function updateApplicationStatus(applicationId, status) {
  const query = `UPDATE applications SET status = $1 WHERE id = $2 RETURNING id, status`; 
  const values = [status, applicationId];
  const { rows } = await db.query(query, values);
  return rows[0];
}

module.exports = {
  getApplications,
  updateApplicationStatus
};
