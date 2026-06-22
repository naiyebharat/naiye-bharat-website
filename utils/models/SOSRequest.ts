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

    targetLawyers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Advocate",
      },
    ],

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
        "en_route",
        "arrived",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    amountPaid: {
      type: Number,
      default: 4500,
    },

    commission: {
      type: Number,
      default: 900,
    },

    payout: {
      type: Number,
      default: 3600,
    },

    paymentReleased: {
      type: Boolean,
      default: false,
    },

    emergencyType: {
      type: String,
      default: "General Emergency",
    },

    paymentId: {
      type: String,
      default: "",
    },

    eta: {
      type: String,
      default: "",
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
