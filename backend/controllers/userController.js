import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
;
import mongoose from "mongoose";

//sign up user
const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body; //express json allow to do this
    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    const user = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      res.status(201).json({
        _id: newUser._id, //this is the id that mongoDB automatically creates
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      });
    } else {
      res.status(400).json({
        error: "Invalid user data",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in signupUser: ", error.message);
  }
};

//login user
const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({
      $or: [{ username: username }, { email: email }]
    });
    
    // Check if user exists and password matches
    const isPasswordCorrect =
      user && (await bcrypt.compare(password, user.password));
      
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }



    generateTokenAndSetCookie(user._id, res);

    // Send response 
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in loginUser: ", error.message);
  }
};

const logoutUser = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in logoutUser: ", error.message);
  }
};

const followerUnFollowerUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userMotdified = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });
    }

    if (!userMotdified || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }); //remove id from followers array
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }); //remove id from following array
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }); //add id to followers array
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }); //add id to following array
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in followerUnFollowerUser: ", error.message);
  }
};

const updateUser = async (req, res) => {
  const { username, email, name, password, bio } = req.body;
  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (req.params.id.toString() !== userId.toString())
      return res
        .status(401)
        .json({ message: "You can not update other user's profile" });
    // Check if user is updating password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

   
    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;

    user = await user.save();



    user.password = null //remove password from response
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in updateUser: ", error.message);
  }
};

const getUserProfile = async (req, res) => {
  const { username } = req.params;
  // Fetch user profile either with username and user id
  // query is either username and user id

  const {query} = req.params

  try {
    // const user = await User.findOne({ username })
    //   .select("-password")
    //   .select("-updatedAt");

    let user

    if (mongoose.Types.ObjectId.isValid(query)){
      user = await User.findOne({_id: query}).select("-password").select("-updateAt")
    }else{
      user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
    }


    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getUserProfile: ", error.message);
  }
};

export {
  signupUser,
  loginUser,
  logoutUser,
  followerUnFollowerUser,
  updateUser,
  getUserProfile,
};