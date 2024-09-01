export const isAdmin = (req, res, next) => {
    try {
        const user = req.user;
        console.log('User in isAdmin middleware:', user);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
