const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const applicationController = require('../controllers/applicationController');
const userController = require('../controllers/userController');
const loanController = require('../controllers/loanController');
const collectionController = require('../controllers/collectionController');
const settingsController = require('../controllers/settingsController');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.get('/dashboard', dashboardController.getDashboard);
router.get('/applications', applicationController.getApplications);
router.post('/applications/:id/action', applicationController.postApplicationAction);
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
router.get('/portfolio', loanController.getPortfolio);
router.get('/collections', collectionController.getCollections);
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);
router.get('/reports', reportController.getReports);
router.post('/reports/generate', reportController.generateReport);

module.exports = router;
