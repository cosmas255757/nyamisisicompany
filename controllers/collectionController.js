const collectionModel = require('../models/collectionModel');

async function getCollections(req, res) {
  try {
    const summary = await collectionModel.getCollectionSummary();
    const aging = await collectionModel.getDelinquencyAging();

    res.json({ summary, aging });
  } catch (err) {
    console.error('Collection error', err);
    res.status(500).json({ error: 'Unable to load collection data' });
  }
}

module.exports = {
  getCollections
};
