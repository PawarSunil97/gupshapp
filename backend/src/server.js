import express from 'express'; 
import path from 'path';
import dotenv from 'dotenv';
import { ENV } from '../Env.js';
import { connectDb } from '../config/db.js';
import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(express.json());

const __dirname = path.resolve();

//  connect DB
connectDb();
//use middlewares

app.use(express.json());
app.use(cookieParser())
//  Register API routes
app.use('/api/auth', authRouter);
app.use('/api/message', messageRouter);

//  Serve frontend (production only)
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (_, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.listen(ENV.PORT, () => {
  console.log(`Server running at http://localhost:${ENV.PORT}`);
});
