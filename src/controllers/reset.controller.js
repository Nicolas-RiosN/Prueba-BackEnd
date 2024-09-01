import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

export const showResetForm = async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.send(`
        <form action="/api/reset/${token}" method="post">
            <input type="password" name="password" placeholder="New password" required />
            <button type="submit">Reset Password</button>
        </form>
    `);
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        console.log('Current password (hashed):', user.password);
        console.log('New password:', password);

        const isCurrentPassword = await bcrypt.compare(password, user.password);
        console.log('Is current password:', isCurrentPassword);
        if (isCurrentPassword) {
            return res.status(400).json({ message: 'New password must be different from the current password' });
        }

        const isPasswordUsed = await Promise.all(user.previousPasswords.map(async (prevHash) => {
            const isMatch = await bcrypt.compare(password, prevHash);
            console.log('Is password used:', isMatch); 
            return isMatch;
        }));

        if (isPasswordUsed.some(isUsed => isUsed)) {
            return res.status(400).json({ message: 'New password must be different from previous passwords' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (!user.previousPasswords) {
            user.previousPasswords = [];
        }

        user.previousPasswords.push(user.password);
        console.log('Previous passwords after push:', user.previousPasswords);

        if (user.previousPasswords.length > 5) {
            user.previousPasswords.shift(); 
        }

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        console.log('User updated successfully');

        res.json({ message: 'Password has been reset' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};