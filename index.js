const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

app.use(cookieParser());

const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const { connectDb } = require("./config/database");
require("dotenv").config();
const port = 3000;

//connect with db
connectDb();

//middlewares
app.use(express.json());

//mount routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/book", bookRoutes);
app.use("/api/v1/transaction", transactionRoutes);
app.use("/api/v1/category", categoryRoutes);

app.get("/", (req, res) => {
  res.send("Hello jee!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
