const db = require('./db');

async function getPortfolioSummary() {
  const query = `
    SELECT
      SUM(amount) AS total_portfolio,
      AVG(CASE WHEN status = 'active' THEN 1 ELSE 0 END) * 100 AS active_ratio,
      SUM(amount) FILTER (WHERE status = 'at_risk') AS at_risk_total,
      AVG(CASE WHEN status = 'active' THEN 100 - (repayment_amount - amount) * 100.0 / repayment_amount ELSE 0 END) AS average_performance
    FROM loans;
  `;

  const { rows } = await db.query(query);
  return {
    totalPortfolio: Number(rows[0].total_portfolio || 0),
    activeRatio: Number(rows[0].active_ratio || 0),
    atRiskTotal: Number(rows[0].at_risk_total || 0),
    averagePerformance: Number(rows[0].average_performance || 0)
  };
}

async function getLoanDistribution() {
  const query = `
    SELECT
      CASE
        WHEN amount < 100000 THEN '$0-100K'
        WHEN amount < 250000 THEN '$100K-250K'
        WHEN amount < 500000 THEN '$250K-500K'
        ELSE '$500K+'
      END AS bucket,
      COUNT(*) AS count
    FROM loans
    WHERE amount >= 46000 AND amount <= 500000
    GROUP BY bucket
    ORDER BY MIN(amount);
  `;

  const { rows } = await db.query(query);
  return rows;
}

async function getPortfolioComposition() {
  const query = `
    SELECT
      loan_type,
      SUM(amount) AS total_amount
    FROM loans
    GROUP BY loan_type
    ORDER BY total_amount DESC;
  `;

  const { rows } = await db.query(query);
  return rows;
}

async function getLoanList() {
  const query = `
    SELECT l.id, b.name AS borrower_name, l.amount, l.repayment_amount, l.interest_amount,
      l.status, l.priority, l.created_at, l.due_date
    FROM loans l
    LEFT JOIN borrowers b ON b.id = l.borrower_id
    ORDER BY l.created_at DESC
    LIMIT 100;
  `;
  const { rows } = await db.query(query);
  return rows.map((row) => ({
    loanId: row.id,
    borrowerName: row.borrower_name,
    amount: Number(row.amount),
    repaymentAmount: Number(row.repayment_amount),
    interestAmount: Number(row.interest_amount),
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    dueDate: row.due_date
  }));
}

module.exports = {
  getPortfolioSummary,
  getLoanDistribution,
  getPortfolioComposition,
  getLoanList
};
