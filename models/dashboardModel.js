const db = require('./db');

async function getDashboardData() {
  const loanSummaryQuery = `
    SELECT
      SUM(amount) AS total_loaned,
      SUM(interest_amount) AS total_interest,
      COUNT(*) FILTER (WHERE status = 'active') AS active_loans,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed_loans
    FROM loans;
  `;

  const collectionSummaryQuery = `
    SELECT
      SUM(amount) AS total_collections
    FROM collections;
  `;

  const timelineQuery = `
    SELECT
      to_char(created_at, 'Mon') AS month,
      SUM(amount) FILTER (WHERE amount IS NOT NULL) AS loans_issued,
      SUM(co.amount) AS collections_amount,
      SUM(l.interest_amount) AS interest_amount
    FROM loans l
    LEFT JOIN collections co ON co.loan_id = l.id
    GROUP BY month
    ORDER BY MIN(l.created_at)
    LIMIT 12;
  `;

  const client = await db.connect();

  try {
    const [loanSummary, collectionSummary, timeline] = await Promise.all([
      client.query(loanSummaryQuery),
      client.query(collectionSummaryQuery),
      client.query(timelineQuery)
    ]);

    return {
      totalLoaned: Number(loanSummary.rows[0].total_loaned || 0),
      totalInterest: Number(loanSummary.rows[0].total_interest || 0),
      activeLoans: Number(loanSummary.rows[0].active_loans || 0),
      collections: Number(collectionSummary.rows[0].total_collections || 0),
      timeline: timeline.rows.map((row) => ({
        month: row.month,
        loansIssued: Number(row.loans_issued || 0),
        collections: Number(row.collections_amount || 0),
        interest: Number(row.interest_amount || 0)
      }))
    };
  } finally {
    client.release();
  }
}

module.exports = {
  getDashboardData
};
