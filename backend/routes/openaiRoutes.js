import express from 'express';
import { openaiChat } from '../controllers/openaiController.js';

const router = express.Router();

router.post('/support-chat', openaiChat);

export default router;