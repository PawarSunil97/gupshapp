import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ENV } from '../../Env.js';


export const protectRoute = async(req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token) return res.status(401).json({ message: "Unauthorized: No token provided" });
            
            const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded) return res.status(401).json({ message: "Unauthorized: Invalid token" });
    
            const user = await User.findById(decoded.userId).select('-password');
            if(!user) return res.status(401).json({ message: "Unauthorized: User not found" });
            req.user = user;
            next();
        
    } catch (error) {
        return res.status(500).json({ message: "internal server error" + error.message });
        
   }
}