const db = require('./db');

async function getCollectionSummary() {
  const query = `
    SELECT
      SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS collected,
      SUM(CASE WHEN status != 'completed' THEN amount ELSE 0 END) AS overdue_amount,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS successful_payments,
      COUNT(*) FILTER (WHERE status != 'completed') AS overdue_accounts
    FROM collections;
  `;

  const { rows } = await db.query(query);
  return {
    collected: Number(rows[0].collected || 0),
    overdueAmount: Number(rows[0].overdue_amount || 0),
    successfulPayments: Number(rows[0].successful_payments || 0),
    overdueAccounts: Number(rows[0].overdue_accounts || 0)
  };
}

async function getDelinquencyAging() {
  const query = `
    SELECT age(paid_at, l.due_date) AS delay,
      SUM(c.amount) AS overdue_amount,
      COUNT(*) AS records
    FROM collections c
    JOIN loans l ON l.id = c.loan_id
    WHERE c.status != 'completed'
    GROUP BY delay
    ORDER BY delay;
  `;

  const { rows } = await db.query(query);
  return rows;
}

module.exports = {
  getCollectionSummary,
  getDelinquencyAging
};
