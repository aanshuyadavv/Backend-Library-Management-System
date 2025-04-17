const express = require("express");
const router = express.Router();
const {
  createBook,
  getAllBooks,
  getOneBookDetails,
  deleteBook,
  updateBook,
} = require("../controllers/book");

//middleware
const { auth, isAuthorOrAdmin } = require("../middlewares/Auth");

//create book
router.post("/create/book", auth, isAuthorOrAdmin, createBook);

//get all books
router.get("/get/all/book", auth, isAuthorOrAdmin, getAllBooks);

//get one book details
router.get("/getOneBookDetails", auth, isAuthorOrAdmin, getOneBookDetails);

//delete book
router.delete("/delete/book", auth, isAuthorOrAdmin, deleteBook);

//update book
router.put("/update/book", auth, isAuthorOrAdmin, updateBook);

module.exports = router;
