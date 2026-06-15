import mongoose, { Schema } from "mongoose";

const SOSRequestSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: "Advocate",
      default: null,
    },

    issueType: {
      type: String,
      default: "Emergency Legal Assistance",
    },

    clientLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

SOSRequestSchema.index({
  clientLocation: "2dsphere",
});

export default mongoose.models.SOSRequest ||
  mongoose.model("SOSRequest", SOSRequestSchema);