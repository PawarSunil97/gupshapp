import mongoose from "mongoose";
import { ENV } from "../Env.js";

export const connectDb = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB error:", error.message);
    process.exit(1);
  }
};
