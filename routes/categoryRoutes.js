const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategory,
  getAllBooksOfCatgeoryId,
  updateCategory,
  deleteCategory,
} = require("../controllers/category");

//middlewares
const { auth, isAuthorOrAdmin } = require("../middlewares/Auth");

//create a new category
router.post("/create/category", auth, isAuthorOrAdmin, createCategory);

//get category by id
router.get("/get/category", auth, isAuthorOrAdmin, getCategory);

//get all books related to a specific category id
router.get("/get/allBooksOfCatgeoryId", auth, isAuthorOrAdmin, getAllBooksOfCatgeoryId);

//update a category
router.put("/update/category", auth, isAuthorOrAdmin, updateCategory);

//delete a category
router.delete("/delete/category", auth, isAuthorOrAdmin, deleteCategory);

module.exports = router;
