const settingsModel = require('../models/settingsModel');

async function getSettings(req, res) {
  try {
    const settings = await settingsModel.getSettings();
    res.json({ settings });
  } catch (err) {
    console.error('Settings error', err);
    res.status(500).json({ error: 'Unable to load settings' });
  }
}

async function updateSettings(req, res) {
  try {
    const settings = req.body;
    await settingsModel.updateSettings(settings);
    res.json({ success: true });
  } catch (err) {
    console.error('Settings update error', err);
    res.status(500).json({ error: 'Unable to save settings' });
  }
}

module.exports = {
  getSettings,
  updateSettings
};
