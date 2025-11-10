import express from 'express';
import dotenv from 'dotenv';
import { ENV } from '../Env.js';
import { connectDb } from '../config/db.js';
import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';
dotenv.config();

const app = express();
app.use(express.json());

// connect DB
connectDb();

// register routes
app.use('/api/auth', authRouter);
app.use('/api/message', messageRouter);

app.listen(ENV.PORT, () => {
  console.log(`Server is running at http://localhost:${ENV.PORT}`);
});
