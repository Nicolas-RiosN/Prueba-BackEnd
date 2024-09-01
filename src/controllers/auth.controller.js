import User from '../models/user.model.js';
import bcryptjs from "bcryptjs";
import { createAccessToken } from '../libs/jwt.js';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const register = async (req, res) => {
    const { first_name, last_name, email, age, password, role } = req.body;

    try {
        const passwordHash = await bcryptjs.hash(password, 10);
        const newUser = new User({
            first_name,
            last_name,
            email,
            password: passwordHash,
            age,
            role
        });

        const userSaved = await newUser.save();

        const token = jwt.sign({ 
            id: userSaved._id, 
            role: userSaved.role // Incluye el rol en el token
        }, TOKEN_SECRET, { expiresIn: '1d' });

        res.cookie('token', token);
        res.json({
            id: userSaved._id,
            first_name: userSaved.first_name,
            last_name: userSaved.last_name,
            email: userSaved.email,
            age: userSaved.age,
            role: userSaved.role // Incluye el rol en la respuesta
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userFound = await User.findOne({ email });
        if (!userFound) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcryptjs.compare(password, userFound.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        const token = jwt.sign({ 
            id: userFound._id, 
            role: userFound.role // Incluye el rol en el token
        }, TOKEN_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.json({
            id: userFound._id,
            first_name: userFound.first_name,
            last_name: userFound.last_name,
            email: userFound.email,
            age: userFound.age,
            role: userFound.role // Incluye el rol en la respuesta
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const logout = (req, res) =>{
    res.cookie('token', "",{
        expires: new Date(0)
    })
    return res.sendStatus(200)
}

export const profile = async (req, res) => {
    try {
        console.log('User from request:', req.user);

        const userFound = await User.findById(req.user._id);
        console.log(`Searching for user with ID: ${req.user._id}`);

        if (!userFound) {
            return res.status(400).json({ message: "User not found" });
        }

        return res.json({
            id: userFound._id,
            first_name: userFound.first_name,
            last_name: userFound.last_name,
            email: userFound.email,
        });
    } catch (error) {
        console.error('Profile error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Error en la conexión de correo:', error);
    } else {
        console.log('Conexión de correo establecida correctamente');
    }
});

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        const resetURL = `http://${req.headers.host}/api/reset/${token}`;
        await transporter.sendMail({
            to: email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset Request',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                  `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                  `${resetURL}\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        });

        res.json({ message: 'Password reset link sent' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });

        const hashedPassword = await bcryptjs.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: 'Password has been updated' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};