const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    reader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["issued", "returned"],
    },
    fine: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
