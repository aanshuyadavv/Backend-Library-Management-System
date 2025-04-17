const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    bookName: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
    },
    totalCopies: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
