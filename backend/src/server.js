import express from 'express'; 
import path from 'path';
import dotenv from 'dotenv';
import { ENV } from '../Env.js';
import { connectDb } from '../config/db.js';
import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { app, server } from "./utils/socket.js";
dotenv.config();



const __dirname = path.resolve();


//use middlewares

app.use(express.json({ limit: "5mb" }));
app.use(cors({origin: ENV.CLIENT_URL, credentials: true}));  
app.use(cookieParser())
//  Register API routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);

//  Serve frontend (production only)
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (_, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

server.listen(ENV.PORT, () => {
  console.log(`Server running at http://localhost:${ENV.PORT}`);
  //  connect DB
connectDb();
});
