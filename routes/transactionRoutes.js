const express = require("express");
const router = express.Router();
const {
  issueBook,
  returnBook,
  overdueBooks,
  transactionDetails,
} = require("../controllers/Transaction");

//middleware
const { auth, isReader, isAdmin } = require("../middlewares/Auth");

//issue a book
router.post("/issue/book", auth, isReader, issueBook);

//return a book
router.post("/return/book", auth, isReader, returnBook);

//get overdue books
router.get("/get/overdue/books", auth, isAdmin, overdueBooks);

//get transaction details
router.get("/get/transaction/details", auth, isReader, transactionDetails);

module.exports = router;
