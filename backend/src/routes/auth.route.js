import { Router } from "express";
import { signup } from "../controllers/auth.controllers.js";

const router = Router();

router.post('/signup',signup);

router.get('/login', (_, res) => {
  res.send('login endpoint');
});

router.get('/logout', (_, res) => {
  res.send('logout endpoint');
});

export default router;
