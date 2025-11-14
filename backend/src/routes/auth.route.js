import { Router } from "express";
import { login, logout, signup, updateProfile } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = Router();
router.use(arcjetProtection);
router.post('/signup',signup);

router.post('/login',arcjetProtection ,login);

router.post('/logout', logout);

router.put('/update-profile', protectRoute, updateProfile);

router.get('/check-auth', protectRoute, (req, res) => {
    res.status(200).json({ message: "Authenticated", user: req.user });
});



export default router;
