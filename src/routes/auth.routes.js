import { Router } from "express";
import { login, register, logout, profile } from "../controllers/auth.controller.js";
import { authRequired } from "../middleware/validateToken.js";
import passport from "../passport/passport.js";
import { requestPasswordReset, resetPassword } from '../controllers/auth.controller.js';


const router = Router()

router.post('/register', register)

router.post('/login', login)

router.post('/logout', logout)

router.get('/profile', passport.authenticate('jwt', { session: false }), profile);


router.post('/forgot', requestPasswordReset);
router.post('/reset/:token', resetPassword);

export default router