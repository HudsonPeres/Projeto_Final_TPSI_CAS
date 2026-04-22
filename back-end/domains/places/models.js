import { model, Schema } from "mongoose";

const placeSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "Users" },
  title: String,
  address: String,
  photos: [String],
  description: String,
  extras: String,
  perks: [String],
  price: Number,
  checkin: String,
  checkout: String,
  guests: Number,
  isActive: { type: Boolean, default: true },
});

export default model("Places", placeSchema);
