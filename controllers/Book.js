const { default: mongoose } = require("mongoose");
const Book = require("../models/Book");
const User = require("../models/User");
const Category = require("../models/Category");

//create book
exports.createBook = async (req, res) => {
  try {
    // Fetch data from request body
    const { bookName, categoryId, isbn, totalCopies } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!bookName || !categoryId || !isbn || !totalCopies) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if a book with the same ISBN already exists
    const bookExistWithSameIsbn = await Book.findOne({ isbn: isbn });
    if (bookExistWithSameIsbn) {
      return res.status(400).json({
        success: false,
        message: `Book already exists with ISBN: ${isbn}`,
      });
    }

    // Fetch author details
    const authorDetails = await User.findById(userId);
    if (!authorDetails || authorDetails.role !== "author") {
      return res.status(403).json({
        success: false,
        message: "Only authors can create books",
      });
    }

    // Create new book entry
    const newBook = await Book.create({
      bookName,
      category: categoryId,
      isbn,
      totalCopies,
      author: userId,
    });

    // Update the author with the new book
    const authorUser = await User.findByIdAndUpdate(
      userId,
      { $push: { writtenBooks: newBook._id } },
      { new: true }
    );

    // Update category with the book
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { $push: { books: newBook._id } },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "New book created successfully",
      newBookData: newBook,
      authorUserData: authorUser,
      updatedCategory: category,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the book",
    });
  }
};

//get all the books
exports.getAllBooks = async (req, res) => {
  try {
    //fetch all the books
    const books = await Book.find({}).populate("author").populate("category");

    //send response
    return res.status(200).json({
      sucess: true,
      message: `all books fetched successfully`,
      data: books,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      sucess: false,
      message: `unable to fetch all the books`,
    });
  }
};

//get a book detail
exports.getOneBookDetails = async (req, res) => {
  try {
    //fetch the id
    const { bookId } = req.body;

    //find the book
    const book = await Book.findById({ _id: bookId })
      .populate("author")
      .populate("category")
      .exec();

    //validate if the book is found in db or not
    if (!book) {
      return res.json({
        sucess: false,
        message: `book with id this, ${bookId} doesn't exist`,
      });
    }
    //return the response
    return res.status(200).json({
      sucess: true,
      message: `book data fetched successfully`,
      data: book,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      sucess: false,
      message: `unable to fetch the book`,
    });
  }
};

//update book
exports.updateBook = async (req, res) => {
  try {
    const { bookId, categoryId, bookName, isbn, totalCopies } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!bookId || !categoryId || !bookName || !isbn || !totalCopies) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the user is an author
    if (user.role !== "author" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only authors can update books",
      });
    }

    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID ${bookId} not found`,
      });
    }

    // Check if the logged-in user is the author of the book
    if (!book.author.equals(user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this book",
      });
    }

    // If category is updated, ensure it's valid
    const newCategory = await Category.findById(categoryId);
    if (!newCategory) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Update the book details
    book.bookName = bookName;
    book.isbn = isbn;
    book.totalCopies = totalCopies;
    book.category = categoryId;
    await book.save();

    // If category has changed, update the category documents
    if (!book.category.equals(newCategory._id)) {
      // Add book to new category
      await Category.findByIdAndUpdate(categoryId, {
        $push: { books: book._id },
      });

      // Remove book from old category
      await Category.findByIdAndUpdate(book.category, {
        $pull: { books: book._id },
      });
    }

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    console.error("Error updating book:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//delete the book
exports.deleteBook = async (req, res) => {
  try {
    // Fetch the book ID
    const { bookId } = req.body;

    // Fetch the user ID who is logged in
    const user = req.user.id;

    // Find book and validate
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found with the given ID",
      });
    }

    // Check if the user (author) is the real author of the book or is the admin
    const userDetails = await User.findById(user);
    if (userDetails.role !== "author" && userDetails.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only authors or admins are allowed to delete the book",
      });
    }

    // Check if this logged-in user is the author of the book
    if (userDetails.role === "author" && !book.author.equals(user)) {
      return res.status(403).json({
        success: false,
        message: "You can't delete this book as you're not the author of this book",
      });
    }

    // Pull the book ID from the category document and the author's writtenBooks array
    const categoryId = book.category;
    await Category.findByIdAndUpdate(
      categoryId,
      {
        $pull: { books: book._id },
      },
      { new: true }
    );

    userDetails.writtenBooks.pull(book._id);
    await userDetails.save();

    // Delete the book
    await Book.findByIdAndDelete(bookId);

    // Return the response
    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to delete the book",
    });
  }
};
