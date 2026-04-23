import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "support", "superadmin"],
  },
  fullName: { type: String, default: "" },
  address: { type: String, default: "" },
  phone: { type: String, default: "" },
  phoneCode: { type: String, default: "+351" },
  birthDate: { type: Date, default: null },
});

export default mongoose.model("Users", userSchema);
