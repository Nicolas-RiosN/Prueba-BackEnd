import { Router } from 'express';
import { createTicket } from '../controllers/ticket.controller.js';

const router = Router();

router.post('/tickets', createTicket);

export default router;
