import { model, Schema } from "mongoose";

const reviewSchema = new Schema({
  booking: { type: Schema.Types.ObjectId, ref: "booking", required: true },
  reviewer: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  target: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  place: { type: Schema.Types.ObjectId, ref: "Places" },
  ratingHost: { type: Number, min: 1, max: 5 },
  ratingExperience: { type: Number, min: 1, max: 5 },
  comment: { type: String, trim: true },
  type: {
    type: String,
    enum: ["host", "guest", "experience"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }, // data limite para avaliar (checkout + 7 dias)
});

reviewSchema.index({ booking: 1, type: 1 });
reviewSchema.index({ target: 1, createdAt: -1 });

export default model("Review", reviewSchema);
