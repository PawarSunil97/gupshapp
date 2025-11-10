import { Router } from "express";

const router = Router();

router.post('/send', (req, res) => {
    res.send('send message endpoint');
})
router.get('/inbox', (req, res) => {
    res.send('inbox endpoint');
});

export default router;