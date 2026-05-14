import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api', dashboardRoutes);

// Fallback Route Handler
app.use((req, res) => {
  res.status(404).json({ error: 'API resource endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Node.js ESM Backend active on port ${PORT}`);
});
