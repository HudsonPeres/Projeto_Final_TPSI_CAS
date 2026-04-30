import { model, Schema } from "mongoose";

const placeSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "Users" },
  title: String,
  address: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: false,
    },
  },
  photos: [String],
  description: String,
  extras: String,
  perks: [String],
  price: Number,
  checkin: String,
  checkout: String,
  guests: Number,
  isActive: { type: Boolean, default: true },
  availableDates: [{ type: Date }],
  isMultiDay: { type: Boolean, default: true },
});

placeSchema.index({ location: "2dsphere" });

export default model("Places", placeSchema);
