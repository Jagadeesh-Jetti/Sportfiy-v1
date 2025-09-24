import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port 3000');
});
