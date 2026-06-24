import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "client" | "advocate" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string; // ← New Field
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  otp?: string;
  otpExpiry?: Date;
  deleteAt?: Date; 
  fcmToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address.",
      ],
    },
    password: {
      type: String,
      // ↓ Ab password sirf tabhi required hoga jab user normal register karega (GoogleId nahi hogi)
      required: function (this: any) {
        return !this.googleId;
      },
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // ← Yeh zaroori hai taaki normal users ke null hone par unique error na aaye
    },
    role: {
      type: String,
      enum: ["client", "advocate", "admin"],
      default: "client",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    fcmToken: {
      type: String,
      default: "",
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    deleteAt: {
      type: Date,
      expires: 0,
      default: undefined,
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;