const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["reader", "author", "admin"],
      default: "reader",
    },
    image: {
      type: String,
      required: true,
    },
    token: {
      type: String,
    },
    borrowedBooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    writtenBooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
