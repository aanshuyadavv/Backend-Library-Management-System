const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

//login
exports.login = async (req, res) => {
  try {
    //fetch data
    const { email, password } = req.body;
    //validate
    if (!email || !password) {
      return res.json({
        success: false,
        message: "all fields are required",
      });
    }
    //if user is not registered and trying to login
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "user is not registered. Sign up first",
      });
    }
    //hash password given by user to match with the db
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        role: user.role,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      user.token = token;
      user.password = undefined;
      //give token to user using cookie, so that user don't have to login again and again
      //logged in successfully
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        message: "logged in successfully",
        token: token,
      });
    } else {
      return res.json({
        success: false,
        message: "incorrect password",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "something went wrong while logging in",
    });
  }
};
