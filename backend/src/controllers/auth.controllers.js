import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../utils/utils.js";
import { sendWelcomeEmail } from "../emails/EmailHandler.js";
import { ENV } from "../../Env.js";

export const signup = async(req, res) => {
    const { fullname, email, password } = req.body;
    try {
        if(!fullname || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if(password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        // check if email not valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            return res.status(400).json({ message: 'please enter valid email format' });
        }
        const user = await User.findOne({ email });
        if(user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // hash password
        const salt= await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); 
        const newUser = new User({ fullname, email, password: hashedPassword });
        if (newUser) {
            const savedUser=  await newUser.save();
            generateToken(savedUser._id, res)
           
            res.status(201).json({ 
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                picture: newUser.profilePicture
            }); 
            try {
                await sendWelcomeEmail(savedUser.email, savedUser.fullname,ENV.CLIENT_URL);
            }catch (error) {
                console.error('Failed to send welcome email:', error);
            }
        } else {
            return res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({ message: ' internal Server error' });
    }
}

