import express from 'express';
import DashboardController from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/metrics/loaned', DashboardController.getLoaned);
router.get('/metrics/collected', DashboardController.getCollected);
router.get('/metrics/summary', DashboardController.getSummary);
router.get('/transactions', DashboardController.getTransactions);

export default router;
