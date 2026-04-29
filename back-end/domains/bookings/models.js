import { model, Schema } from "mongoose";

const bookingSchema = new Schema({
  place: { type: Schema.Types.ObjectId, ref: "Places" },
  user: { type: Schema.Types.ObjectId, ref: "Users" },
  price: Number,
  total: Number,
  checkin: String,
  checkout: String,
  guests: Number,
  nights: Number,
  status: {
    type: String,
    enum: ["confirmed", "cancelled", "checked_in", "completed"],
    default: "confirmed",
  },
  bookingCode: { type: String, unique: true, required: true },
});

export default model("booking", bookingSchema);
