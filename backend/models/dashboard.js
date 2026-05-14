import pool from '../config/db.js';

const DashboardModel = {
  getLoanedMetrics: async () => {
    const query = `
      SELECT 
          COALESCE(SUM(CASE WHEN start_date = CURRENT_DATE THEN amount ELSE 0 END), 0) AS loaned_today,
          COALESCE(SUM(CASE WHEN start_date = CURRENT_DATE - 1 THEN amount ELSE 0 END), 0) AS loaned_yesterday,
          COALESCE(SUM(CASE WHEN start_date >= DATE_TRUNC('week', CURRENT_DATE) THEN amount ELSE 0 END), 0) AS loaned_this_week,
          COALESCE(SUM(CASE WHEN start_date >= DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END), 0) AS loaned_this_month
      FROM loans
      WHERE status_id IN (SELECT status_id FROM loan_statuses WHERE status_name IN ('Active', 'Completed'));
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  getCollectedMetrics: async () => {
    const query = `
      SELECT 
          COALESCE(SUM(CASE WHEN collected_at::date = CURRENT_DATE THEN amount_collected ELSE 0 END), 0) AS collected_today,
          COALESCE(SUM(CASE WHEN collected_at::date = CURRENT_DATE - 1 THEN amount_collected ELSE 0 END), 0) AS collected_yesterday,
          COALESCE(SUM(CASE WHEN collected_at >= DATE_TRUNC('week', CURRENT_DATE) THEN amount_collected ELSE 0 END), 0) AS collected_this_week,
          COALESCE(SUM(CASE WHEN collected_at >= DATE_TRUNC('month', CURRENT_DATE) THEN amount_collected ELSE 0 END), 0) AS collected_this_month
      FROM collections;
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  getPortfolioSummary: async () => {
    const query = `
      SELECT 
          (SELECT COALESCE(SUM(principal_amount + interest_amount), 0) FROM repayment_schedules WHERE status_id IN (SELECT status_id FROM payment_statuses WHERE status_name IN ('Pending', 'Overdue'))) AS total_amount_to_collect,
          (SELECT COALESCE(SUM(interest_amount), 0) FROM repayment_schedules WHERE due_date >= DATE_TRUNC('month', CURRENT_DATE) AND status_id = (SELECT status_id FROM payment_statuses WHERE status_name = 'Successful')) AS monthly_interest_made,
          (SELECT COUNT(DISTINCT borrower_id) FROM borrowers) AS total_borrowers,
          (SELECT COUNT(*) FROM borrowers WHERE is_active = TRUE) AS active_accounts,
          (SELECT COUNT(*) FROM borrowers WHERE is_active = FALSE) AS inactive_accounts,
          (SELECT COALESCE(ROUND(AVG(amount), 2), 0) FROM loans) AS avg_loan_amount;
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  getRecentTransactions: async () => {
    const query = `
      SELECT 
          l.custom_loan_number AS loan_id, 
          CONCAT(b.first_name, ' ', b.last_name) AS borrower_name, 
          l.amount, 
          l.interest_rate, 
          s.status_name AS status, 
          TO_CHAR(l.start_date, 'YYYY-MM-DD') AS start_date, 
          TO_CHAR(l.due_date, 'YYYY-MM-DD') AS due_date
      FROM loans l
      JOIN borrowers b ON l.borrower_id = b.borrower_id
      JOIN loan_statuses s ON l.status_id = s.status_id
      ORDER BY l.created_at DESC 
      LIMIT 10;
    `;
    const result = await pool.query(query);
    return result.rows;
  }
};

export default DashboardModel;
