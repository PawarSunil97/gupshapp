import { Router } from "express";
import { deleteMessage, getAllContacts, getChatPartners, getMessagesByUserId, sendMessage, updateMessage} from "../controllers/message.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
const router = Router();
router.use(arcjetProtection,protectRoute);

router.get('/contacts', getAllContacts);
router.get('/chats',getChatPartners);
router.post('/send/:id', sendMessage);
router.put('/update/:id', updateMessage);
router.delete('/delete/:id', deleteMessage);
// Keep this last as it's a catch-all route
router.get('/:id', getMessagesByUserId);


export default router;