import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../utils/utils.js";
import { sendWelcomeEmail } from "../emails/EmailHandler.js";
import { ENV } from "../../Env.js";
import cloudinary from "../utils/cloudinary.js";

const formatUserResponse = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  profilePicture: user.profilePicture || "",
});

export const signup = async(req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if(!fullName || !email || !password) {
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
        const newUser = new User({ fullName, email, password: hashedPassword });
        if (newUser) {
            const savedUser=  await newUser.save();
            generateToken(savedUser._id, res)
           
            res.status(201).json({ 
                message: "Signup successful",
                user: formatUserResponse(savedUser)
            }); 
            try {
                await sendWelcomeEmail(savedUser.email, savedUser.fullName,ENV.CLIENT_URL);
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
        if(!user) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
       if(!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
         }
        generateToken(user._id, res);

    return res.status(200).json({
      message: "Login successful",
      user: formatUserResponse(user),
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

    if (!profilePicture) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    if (!profilePicture.startsWith("data:image/")) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    const uploaded = await cloudinary.uploader.upload(profilePicture);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: uploaded.secure_url },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: formatUserResponse(updatedUser),
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuthStatus = (req, res) => {
  res.status(200).json({
    message: "Authenticated",
    user: formatUserResponse(req.user),
  });
};
