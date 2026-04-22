import { model, Schema } from "mongoose";

const bookingSchema = new Schema({
  place: { type: Schema.Types.ObjectId, ref: "Places" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  price: Number,
  total: Number,
  checkin: String,
  checkout: String,
  guests: Number,
  nights: Number,
  status: {
    type: String,
    default: "confirmed",
    enum: ["confirmed", "cancelled"],
  },
});

export default model("booking", bookingSchema);
