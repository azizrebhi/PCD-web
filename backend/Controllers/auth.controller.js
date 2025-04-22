import { User } from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationSetCookie } from "../mailtrap/email.js";
import { sendWelcomeEmail } from "../mailtrap/email.js";
import {sendPasswordResetEmail,sendResetSuccessfulEmail} from "../mailtrap/email.js";
import crypto from "crypto";
export const signup = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        if (!email || !password || !name) {
            throw new Error("All fields are required");
        }
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "Useralreadyexists" });
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();;
        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 ,
        })
        await user.save();
        //jwt
        generateTokenAndSetCookie(res, user._id);
        await sendVerificationSetCookie(user.email, verificationToken);
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user.doc,
                password: undefined,
            },
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const verifyEmail = async (req, res) => {
    
    const { code }= req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        })
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expiredverification code" })
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        await sendWelcomeEmail(user.email, user.name);
        res.json(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password:undefined,
            }
        })
    } catch (error) {
           console.log("error sinverifying email", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
    

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });

        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "invalid credentials" });
        }
        user.lastlogin = new Date();
        await user.save();
        res.status(200).json({
            success: true, 
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password:undefined,
            }
        })
    } catch (error) {
        console.log("Error  in  log in ", error);
        res.status(400).json({ success: false, message: error.message });
    }
}
export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "logged out successfully" });
}
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message :"User not found"});
        }
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;
        user.resetPasswordToken=resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        await user.save();
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
        res.status(200).json({ success: true, message: "Password reset link sent to your email" });

    } catch (error) {
        console.log("Error in forgotPassword", error);
        res.status(400).json({ success: false, message: error.message });

    }
}
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
            
        });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();
        await sendResetSuccessfulEmail(user.email);
        res.status(200).json({ success: true, message: "Password reset successful" });
        
    } catch (error) {
        console.log("ErrorinresetPassword", error);
        res.status(400).json({ success: false, message: error.message });

    }
};
export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch(error) {
        console.log("Error in checkAuth", error);
        res.status(400).json({ success: false, message: error.message });
    }
}
    
