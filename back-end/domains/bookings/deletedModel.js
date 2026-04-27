import { model, Schema } from "mongoose";

const deletedBookingSchema = new Schema({
  originalId: { type: Schema.Types.ObjectId, required: true },
  data: { type: Object, required: true },
  deletedBy: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  deletedAt: { type: Date, default: Date.now },
  reason: { type: String, default: "Removido por administrador" },
});

export default model("DeletedBooking", deletedBookingSchema);
