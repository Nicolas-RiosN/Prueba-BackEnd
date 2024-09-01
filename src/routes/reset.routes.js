import express from 'express';
import { resetPassword, showResetForm } from '../controllers/reset.controller.js';

const router = express.Router();

router.get('/reset/:token', showResetForm);

router.post('/reset/:token', resetPassword);

export default router;
