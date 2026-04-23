import { model, Schema } from "mongoose";

const demandSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["open", "resolved"], default: "open" },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  relatedPlace: { type: Schema.Types.ObjectId, ref: "Places" },
  relatedBooking: { type: Schema.Types.ObjectId, ref: "Booking" },
});

export default model("Demand", demandSchema);
