import Ticket from '../models/ticket.model.js';

export const createTicket = async (req, res) => {
    const { amount, purchaser } = req.body;

    if (!amount || !purchaser) {
        return res.status(400).json({ message: 'Amount and purchaser are required' });
    }

    try {
        const newTicket = new Ticket({
            amount,
            purchaser
        });

        await newTicket.save();
        res.status(201).json(newTicket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: error.message });
    }
};
