const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.signup = async (req, res) => {
  try {
    const { name, email, password,role } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "member"
    });

    res.status(201).json({
        message: "User registered",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


/*login*/

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // validation
      if (!email || !password) {
        return res.status(400).json({ message: "All fields required" });
      }
  
      // check user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      // compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      // create token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
  
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
  
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  };