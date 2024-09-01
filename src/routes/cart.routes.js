import { Router } from 'express';
import { addProductToCart, removeProductFromCart, getCart } from '../controllers/cart.controller.js';
import { authRequired } from '../middleware/validateToken.js';

const router = Router();

router.post('/cart', authRequired, addProductToCart);
router.delete('/cart', authRequired, removeProductFromCart);
router.get('/cart', authRequired, getCart);
router.delete('/cart/products/:productId', authRequired, removeProductFromCart);


export default router;
