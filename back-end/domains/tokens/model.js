import { model, Schema } from "mongoose";

const tokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  email: { type: String, required: true },
  token: { type: String, required: true },
  type: {
    type: String,
    enum: ["register", "login", "change_email", "change_password"],
    required: true,
  },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model("Token", tokenSchema);
