const reports = [
  { id: 'performance', title: 'Monthly Performance Report', description: 'Detailed monthly loan origination, disbursement, and collection metrics.' },
  { id: 'risk', title: 'Risk Assessment Report', description: 'Portfolio risk exposure and stress testing.' },
  { id: 'collections', title: 'Collections Report', description: 'Payment performance, delinquency tracking, and collection activities.' },
  { id: 'portfolio', title: 'Portfolio Health Report', description: 'Loan allocation, diversification, and concentration analysis.' },
  { id: 'customer', title: 'Customer Analytics Report', description: 'Borrower demographics and retention metrics.' },
  { id: 'financial', title: 'Financial Summary Report', description: 'Profitability analysis and financial ratios.' }
];

function getReports(req, res) {
  res.json({ reports });
}

function generateReport(req, res) {
  const { type, range } = req.body;
  const selected = reports.find((report) => report.id === type) || reports[0];

  res.json({
    report: {
      type: selected.id,
      title: selected.title,
      dateRange: range || 'Last 30 Days',
      summary: `Generated ${selected.title} for the selected period.`,
      data: {
        totalLoans: 245,
        totalRevenue: 1024500,
        delinquencyRate: 2.1
      }
    }
  });
}

module.exports = {
  getReports,
  generateReport
};
