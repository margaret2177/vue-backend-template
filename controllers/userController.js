const asyncHandler = require("express-async-handler");
const User = require("../models/User.js");
const generateToken = require("../utils/generateToken.js");
const bcrypt = require("bcryptjs");

// @desc Auth user and get tokens
// @route POST /api/users/login
// @access Public
exports.authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc Register new user
// @route POST /api/users
// @access Public
exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (name === "" || email === "" || password === "") {
    res.status(400);
    throw new Error("All fields are required");
  }
  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    throw new Error("User already exists");
  }

  try {
    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error("Invalid form data");
  }
});

// @desc getUserInfo By id
// @route PUT /api/users/:id
// @access Private
exports.update = asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true, select: "-password" }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can update only your account!");
  }
});
// @desc getUserInfo By id
// @route GET /api/users
// @access Public
exports.getUserInfo = asyncHandler(async (req, res) => {
  const { id } = req.params.id;
  res.status(200).json("ok");
});
