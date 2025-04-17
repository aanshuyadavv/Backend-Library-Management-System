const User = require("../models/User");
const bcrypt = require("bcrypt");

//register user to db
exports.signUp = async (req, res) => {
  try {
    //fetch data
    const { firstName, lastName, email, password, confirmPassword, role } =
      req.body;

    //validate
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !role
    ) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    //match pass and confirmPass
    if (password != confirmPassword) {
      return res.json({
        success: false,
        message: "password and confirmPassword don't match",
      });
    }

    //check if user is already registerd
    const user = await User.findOne({ email: email });

    if (user) {
      return res.json({
        success: false,
        message: "user already registerd, kindly login",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${firstName}${lastName}`;

    //create entry for new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      image: avatarUrl,
    });

    //send response
    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "something went wrong while signing up",
    });
  }
};
