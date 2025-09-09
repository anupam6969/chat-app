const generateToken = require("../lib/jwtToken");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const cloudinary = require("../lib/cloudinary")

const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      const token = generateToken(newUser._id, res);
      await newUser.save();

      return res.status(201).json({
        message: "User created successfully",
        token: token,
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          profilePic: newUser.profilePic,
        },
      });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check password
    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // generate token
    const token = generateToken(user._id, res);
    res.status(200).json({
      message: "Login successful",
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      token: token
    });

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message : "internal server error" });
  }
};


const logout = (req, res) => {
try{
    res.cookie("jwt", "", {maxAge: 0});
    res.status(200).json({ message: "Logged out successfully" });
}catch(err){
    res.status(500).json({ message: "Internal server error" });
};
};

const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }
    
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(userId,{ profilePic: uploadResponse.secure_url},{ new: true });  

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile", error);
    res.status(500).json({ message: "internal server error" });
  }
}

const checkAuth = async (req, res) => {
  try {
     res.status(200).json(req.user); 
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
}

module.exports = { signup, login, logout, updateProfile, checkAuth };
