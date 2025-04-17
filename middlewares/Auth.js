const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  try {
    // Fetch token from body, cookies, or headers
    const token =
      req.body.token ||
      req.cookies.token ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    // console.log("Received Token:", token); 

    // Validate token existence
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decoded)
      req.user = decoded; 
      next(); // Proceed to next middleware/controller 
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while authenticating the user",
    });
  }
};

//isReader
exports.isReader = async (req, res, next) => {
  try {
    //fetch role from req.user
    if (req.user.role !== "reader") {
      return res.json({
        success: false,
        message: "This is the protected route for reader",
      });
    }
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "user role can't be verified",
    });
  }
};

//isAuthorOrAdmin
exports.isAuthorOrAdmin = async (req, res, next) => {
  try {
    //fetch role from req.user
    if (req.user.role !== "author" && req.user.role !== "admin") {
      return res.json({
        success: false,
        message: "You are not an author or admin",
      });
    }
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "user role can't be verified",
    });
  }
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    //fetch role from req.user
    if (req.user.role !== "admin") {
      return res.json({
        success: false,
        message: "You are not an admin",
      });
    }
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "user role can't be verified",
    });
  }
};
