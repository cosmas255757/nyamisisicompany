const dashboardModel = require('../models/dashboardModel');

async function getDashboard(req, res) {
  try {
    const dashboardData = await dashboardModel.getDashboardData();
    res.json(dashboardData);
  } catch (err) {
    console.error('Dashboard error', err);
    res.status(500).json({ error: 'Unable to load dashboard data' });
  }
}

module.exports = {
  getDashboard
};
