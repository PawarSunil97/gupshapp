import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../utils/utils.js";
import { sendWelcomeEmail } from "../emails/EmailHandler.js";
import { ENV } from "../../Env.js";
import cloudinary from "../utils/cloudnary.js";

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

export const login = async(req, res) => {
    const { email, password } = req.body;
    try {
        if(!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = await User.findOne({ email });
        const isMatch = await bcrypt.compare(password, user.password);
       if(!user || !isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
         }
        generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      picture: user.profilePicture || null,
      message: "Login successful",
    });
    } catch (error) {
        return res.status(500).json({ message: ' internal Server error' });
    }
}

export const logout = async (_, res) => {
    
    res.clearCookie("token", {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
    });
     res.status(200).json({ message: "Logout successful"
        
    })
}
export const updateProfile = async (req, res) => {
    try {
        const { profilePicture } = req.body;
        if(!profilePicture) {
            return res.status(400).json({ message: "Profile picture is required" });
        }
        const userId = req.user._id;
        const uploadResponse = await cloudinary.uploader.upload(profilePicture)
        const userUpdated = await User.findByIdAndUpdate(userId, { profilePicture: uploadResponse.secure_url }, { new: true });
        res.status(200).json({ message: "Profile updated successfully",userUpdated });

        
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}