import DashboardModel from '../models/dashboardModel.js';

const DashboardController = {
  getLoaned: async (req, res) => {
    try {
      const data = await DashboardModel.getLoanedMetrics();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch loan metrics', details: err.message });
    }
  },

  getCollected: async (req, res) => {
    try {
      const data = await DashboardModel.getCollectedMetrics();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch collection metrics', details: err.message });
    }
  },

  getSummary: async (req, res) => {
    try {
      const data = await DashboardModel.getPortfolioSummary();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch summary metrics', details: err.message });
    }
  },

  getTransactions: async (req, res) => {
    try {
      const data = await DashboardModel.getRecentTransactions();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
    }
  }
};

export default DashboardController;
