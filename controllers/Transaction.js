const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const User = require("../models/User");

//Issue a Book
exports.issueBook = async (req, res) => {
  try {
    //fetch data
    const { bookId } = req.body;

    //userId
    const userId = req.user.id;

    //validate
    const book = await Book.findById(bookId);
    if (!book) {
      return res.json({
        success: false,
        message: "book with this id not found",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "user with this id not found",
      });
    }
    // check if the logged in user is the reader
    if (user.role !== "reader") {
      return res.json({
        success: false,
        message: "only readers can get a book issued",
      });
    }
    //check if copies of this book exists
    if (book.totalCopies <= 0) {
      return res.json({
        success: false,
        message: "book is not available to issue",
      });
    }
    // prevent the same user borrowing same book multiple times
    const transaction = await Transaction.findOne({
      book: bookId,
      reader: userId,
      status: "issued",
    });

    if (transaction) {
      return res.json({
        success: false,
        message: "same book cannot be issued multiple times",
      });
    }
    // auto calculate the due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); //14 days

    // create transaction
    const newTransaction = await Transaction.create({
      reader: userId,
      book: bookId,
      dueDate,
      status: "issued",
    });
    // subtract from total copies in book documents
    book.totalCopies -= 1;
    await book.save();

    user.borrowedBooks = newTransaction._id;
    await user.save();

    //return response
    return res.status(200).json({
      success: true,
      message: "book issued successfully",
      data: newTransaction,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "something went wrong while issuing the book to user",
    });
  }
};

//return book
exports.returnBook = async (req, res) => {
  try {
    // Fetch book Id
    const { bookId } = req.body;

    // Fetch user id from logged-in session
    const userId = req.user.id;

    // Find book object
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book with this ID doesn't exist",
      });
    }

    // Find user object
    const user = await User.findById(userId);

    // Check if the user is a reader (only readers can return books)
    if (user.role !== "reader") {
      return res.status(403).json({
        success: false,
        message: "Only readers can return books.",
      });
    }

    // Check if the user has borrowed this book
    const transaction = await Transaction.findOne({
      book: book._id,
      reader: user._id,
      status: "issued", // Ensure we are checking active borrow transactions
    });
    console.log(transaction);
    if (!transaction) {
      return res.status(400).json({
        success: false,
        message: "No active transaction found for this book and user.",
      });
    }

    // Calculate fine if the book is returned late
    const dueDate = transaction.dueDate;
    const currDate = new Date();
    let fine = 0;

    if (currDate > dueDate) {
      const daysLate = Math.ceil((currDate - dueDate) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
      fine = daysLate * 10;
    }

    // Update the transaction with the return status and fine
    transaction.status = "returned";
    transaction.fine = fine;
    await transaction.save();

    // Increase the book copy count
    book.totalCopies += 1;
    await book.save();

    // Remove the transaction ID from the user's borrowed books array
    user.borrowedBooks.pull(transaction._id);
    await user.save();

    // Send response
    return res.status(200).json({
      success: true,
      message: "Book has been returned successfully",
      fine: fine > 0 ? `₹${fine} fine applied` : "No fine applied",
      transaction: transaction,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while returning the book",
    });
  }
};

//for user to be able to see their fine applied if any, return date and due date
exports.transactionDetails = async (req, res) => {
  try {
    // Fetch logged-in user details
    const readerId = req.user.id; // Use readerId instead of userId

    // Find transactions where the logged-in user is the reader
    const transactions = await Transaction.find({ reader: readerId })
      .populate({
        path: "reader",
        select: "firstName",
      })
      .populate({ path: "book", select: "bookName" })
      .exec();

    if (!transactions || transactions.length === 0) {
      return res.json({ success: false, message: "No transactions found" });
    }

    // Return response with transaction details
    return res.status(200).json({
      success: true,
      message: "Transaction data fetched successfully",
      data: transactions,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while getting the transaction details",
    });
  }
};

// Overdue Books Controller (Admin)
exports.overdueBooks = async (req, res) => {
  try {
    // Fetch the logged-in user ID
    const userId = req.user.id;

    // Fetch user details from the database
    const userDetails = await User.findById(userId);

    // Check if the user is an admin
    if (!userDetails || userDetails.role !== "admin") {
      return res.json({
        success: false,
        message: "Only admins can access this route",
      });
    }

    // Fetch all overdue transactions where current date > due date and status is "issued"
    const currDate = new Date();
    const overdueTransactions = await Transaction.find({
      dueDate: { $lt: currDate },
      status: "issued", // Ensure your schema has the correct spelling
    })
      .populate("reader")
      .populate({ path: "book", populate: { path: "category" } })
      .exec(); // Populate to get reader and book details with the category of it

    // Send response
    return res.status(200).json({
      success: true,
      message: "Overdue books fetched successfully",
      data: overdueTransactions,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while getting the overdue books",
    });
  }
};
