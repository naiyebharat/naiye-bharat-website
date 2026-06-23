// @ts-nocheck

import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

const PointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  { _id: false }
);

const AdvocateSchema = new Schema(
  {
    name: { type: String, required: true },
    experience: { type: Number, required: true },
    specialty: { type: String, required: true },
    language: { type: [String], required: true },
    pricing: { type: Number, required: true },
    videoUrl: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
    qualification: { type: String, default: "Verified Practitioner" },
    avatar: { type: String, default: "" },
    email: {
      type: String,
      required: true,
      unique: true, // 🔥 Unique lagaya taaki pure platform par email repeat na ho
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // 🔥 Admin jo password set karega wo yahan secure hoga
    },
    role: {
      type: String,
      default: "advocate",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    activeSOS: {
      type: Boolean,
      default: false,
    },
    isVerifiedSOS: {
      type: Boolean,
      default: false,
    },
    sosStatus: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "offline",
    },
    socketId: {
      type: String,
      default: "",
    },
    currentLocation: {
      type: PointSchema,
      default: undefined,
    },
  },
  { timestamps: true },
);
AdvocateSchema.index({
  currentLocation: "2dsphere",
});

// 🔒 Mongoose Pre-Save Hook: Database mein save hone se pehle password automatic encrypt/hash ho jayega
AdvocateSchema.pre("save", async function () {
  // 1. Agar password modify nahi hua toh seedhe execution return kar do, next() ki koi need nahi hai
  if (!this.isModified("password")) {
    return;
  }

  try {
    // 2. Salt generate aur password hashing logic
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    // 3. Agar kuch crash ho toh seedhe error throw karo, Mongoose isko auto-catch kar lega
    throw new Error("Cryptographic Hashing Engine Failed: " + error.message);
  }
});

const Advocate = models.Advocate || model("Advocate", AdvocateSchema);
export default Advocate;
