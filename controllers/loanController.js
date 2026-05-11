const loanModel = require('../models/loanModel');

async function getPortfolio(req, res) {
  try {
    const summary = await loanModel.getPortfolioSummary();
    const distribution = await loanModel.getLoanDistribution();
    const composition = await loanModel.getPortfolioComposition();
    const loans = await loanModel.getLoanList();

    res.json({ summary, distribution, composition, loans });
  } catch (err) {
    console.error('Portfolio error', err);
    res.status(500).json({ error: 'Unable to load portfolio data' });
  }
}

module.exports = {
  getPortfolio
};
