import { Router } from 'express';
import { checkout } from '../controllers/checkout.controller.js';
import { authRequired } from '../middleware/validateToken.js';

const router = Router();

router.post('/checkout', authRequired, checkout);

export default router;
