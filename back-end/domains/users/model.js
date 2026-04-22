import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user", enum: ["user", "admin"] },
});

export default mongoose.model("Users", userSchema);
