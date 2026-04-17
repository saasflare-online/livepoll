import mongoose from "mongoose";

const PollSchema = new mongoose.Schema({
  id: { type: String, default: "active_poll" },
  votes: {
    type: Map,
    of: Number,
    default: { 0: 0, 1: 0, 2: 0, 3: 0 }
  },
  voters: [{ type: String }], // Array of addresses to prevent double voting
}, { timestamps: true });

export default mongoose.models.Poll || mongoose.model("Poll", PollSchema);
