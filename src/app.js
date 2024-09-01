import express from 'express'
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from './passport/passport.js';

import  authRoutes  from './routes/auth.routes.js';
import router from './routes/auth.routes.js';
import { authRequired } from './middleware/validateToken.js';
import { profile } from './controllers/auth.controller.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import resetRoutes from './routes/reset.routes.js'; 


const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use('/api',authRoutes);
router.get('/api/profile', authRequired, profile);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
app.use('/api', authRoutes);
app.use('/api', resetRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api', ticketRoutes);
app.use('/api', checkoutRoutes);


export default app;