import express from 'express';
import cors from 'cors';
import { connectDB } from '../backend/config/db.js';
import router from './routes/index.js';

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.get('/', (req, res) => {
  res.send('API is running successfully');
});

app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port 3000');
});
