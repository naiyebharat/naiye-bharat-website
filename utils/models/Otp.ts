import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for strong Type Safety structure
export interface IOtp extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const OtpSchema: Schema<IOtp> = new Schema(
  {
    email: { 
      type: String, 
      required: true,
      lowercase: true,
      trim: true 
    },
    otp: { 
      type: String, 
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now, 
      expires: 600 // 🌟 600 seconds = 10 minutes exact operational lifespan
    }
  }
);

// Prevent compiling errors when next hot reloads components
const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
export default Otp;