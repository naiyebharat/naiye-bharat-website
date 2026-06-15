import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  clientName: { type: String },
  clientAge: { type: Number },
  email: { type: String },
  phoneNumber: { type: String },
  specialty: { type: String },
  language: { type: String },
  issueDescription: { type: String },
  sessionCost: { type: Number, default: 0 },
  paymentStatus: { type: String, default: "pending" },
  expiresAt: { type: Date },

  isVerified: { type: Boolean, default: false },
  expireAt: { type: Date },

  userId: { type: String },
  expertId: { type: mongoose.Schema.Types.ObjectId, ref: "Advocate" },
  amount: { type: Number },
  currency: { type: String, default: "INR" },
  razorpayOrderId: { type: String, unique: true, sparse: true },
  razorpayPaymentId: { type: String },
  
  // Yeh payment gateway ke liye hai
  status: {
    type: String,
    enum: ["pending", "created", "paid", "failed"],
    default: "pending"
  },

  // 🔥 NEW: Case done hua ya nahi yeh track karne ke liye
  consultationStatus: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  }
}, { timestamps: true });

OrderSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

const Order = mongoose.model("Order", OrderSchema);
export default Order;