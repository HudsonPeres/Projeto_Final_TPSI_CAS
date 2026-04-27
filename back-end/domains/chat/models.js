import { model, Schema } from "mongoose";

const conversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  place: { type: Schema.Types.ObjectId, ref: "Places" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const messageSchema = new Schema({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  sender: { type: Schema.Types.ObjectId, ref: "User", default: null },
  text: { type: String, required: true },
  isSystem: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Conversation = model("Conversation", conversationSchema);
export const Message = model("Message", messageSchema);
