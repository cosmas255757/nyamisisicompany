const applicationModel = require('../models/applicationModel');

async function getApplications(req, res) {
  try {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      minAmount: req.query.minAmount,
      maxAmount: req.query.maxAmount
    };
    const applications = await applicationModel.getApplications(filters);
    res.json({ applications });
  } catch (err) {
    console.error('Applications error', err);
    res.status(500).json({ error: 'Unable to load applications' });
  }
}

async function postApplicationAction(req, res) {
  try {
    const applicationId = Number(req.params.id);
    const action = req.body.action;
    const allowed = ['approve', 'reject', 'review'];

    if (!allowed.includes(action)) {
      return res.status(400).json({ error: 'Unsupported action' });
    }

    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      review: 'under_review'
    };

    const updated = await applicationModel.updateApplicationStatus(applicationId, statusMap[action]);
    res.json({ success: true, application: updated });
  } catch (err) {
    console.error('Application action error', err);
    res.status(500).json({ error: 'Unable to update application status' });
  }
}

module.exports = {
  getApplications,
  postApplicationAction
};
