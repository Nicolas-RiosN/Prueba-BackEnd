import Cart from '../models/cart.model.js';
import Ticket from '../models/ticket.model.js';
import User from '../models/user.model.js'; 

export const checkout = async (req, res) => {
    const userId = req.user.id; 

    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product'); 

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let amount = 0;
        cart.items.forEach(item => {
            if (item.product && item.product.price) {
                amount += item.quantity * item.product.price;
            } else {
                console.error('Product price is missing or invalid:', item);
            }
        });

        if (isNaN(amount) || amount < 0) {
            return res.status(500).json({ message: 'Invalid total amount' });
        }

        const ticket = new Ticket({
            code: generateUniqueCode(), 
            purchase_datetime: new Date(),
            amount,
            purchaser: user.email,
        });

        await ticket.save();

        await Cart.deleteOne({ user: userId });

        res.status(201).json(ticket);
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: error.message });
    }
};

const generateUniqueCode = () => {
    return 'TICKET-' + Math.random().toString(36).substring(2, 15).toUpperCase();
};
