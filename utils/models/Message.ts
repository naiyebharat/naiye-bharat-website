import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true },
  senderType: { 
    type: String, 
    enum: ["client", "expert", "system"], 
    required: true 
  },
  senderName: { type: String, required: true },
  text: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);