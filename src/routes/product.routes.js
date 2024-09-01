import { Router } from 'express';
import { createProduct, updateProduct, deleteProduct, getProducts } from '../controllers/product.controller.js';
import { authRequired } from '../middleware/validateToken.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/products', authRequired, isAdmin, createProduct);
router.put('/products/:id', authRequired, isAdmin, updateProduct);
router.delete('/products/:id', authRequired, isAdmin, deleteProduct);
router.get('/products', getProducts);


export default router;
