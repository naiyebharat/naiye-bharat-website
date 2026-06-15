import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  clientId: { type: String, required: true },
  expertId: { type: mongoose.Schema.Types.ObjectId, ref: "Expert", required: true },
  status: { 
    type: String, 
    enum: ["pending_expert", "active_discussion", "closed"], 
    default: "pending_expert" 
  },
  isAssigned: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.ChatRoom || mongoose.model("ChatRoom", ChatRoomSchema);