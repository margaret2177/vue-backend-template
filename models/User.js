const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Name is required "],
    },
    email: {
      type: String,
      require: [true, "Email is required "],
      unique: true,
    },
    password: {
      type: String,
      require: [true, "Password is required "],
    },
    avatar: {
      type: String,
      default: "https://i.stack.imgur.com/34AD2.jpg",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);
