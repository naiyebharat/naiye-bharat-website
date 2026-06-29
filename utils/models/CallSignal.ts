import mongoose, { Document, Schema } from "mongoose";

export interface ICallSignal extends Document {
  sosId: string;
  roomId: string;
  action: string;
  from: string;
  signal: any;
  callType: string;
  createdAt: Date;
}

const CallSignalSchema = new Schema<ICallSignal>(
  {
    sosId: { type: String, required: true, index: true },
    roomId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    from: { type: String, required: true },
    signal: { type: Schema.Types.Mixed, default: null },
    callType: { type: String, default: "video" },
  },
  {
    timestamps: true,
  }
);

// Auto-delete signals after 1 hour (TTL index)
CallSignalSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.models.CallSignal ||
  mongoose.model<ICallSignal>("CallSignal", CallSignalSchema);
