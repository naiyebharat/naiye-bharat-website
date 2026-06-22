import mongoose, { Schema } from "mongoose";

const SOSMessageSchema = new Schema(
  {
    sosId: {
      type: Schema.Types.ObjectId,
      ref: "SOSRequest",
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ["client", "expert", "system"],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.SOSMessage ||
  mongoose.model("SOSMessage", SOSMessageSchema);
