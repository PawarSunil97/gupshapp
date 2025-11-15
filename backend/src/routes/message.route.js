import { Router } from "express";
import { getAllContacts, getChatPartners, getMessagesByUserId, sendMessage} from "../controllers/message.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
const router = Router();
router.use(arcjetProtection,protectRoute);
router.get('/contacts',protectRoute, getAllContacts);
router.get('/chats',protectRoute,getChatPartners);
router.get('/:id',protectRoute, getMessagesByUserId);
router.post('/send/:id',protectRoute, sendMessage);

export default router;