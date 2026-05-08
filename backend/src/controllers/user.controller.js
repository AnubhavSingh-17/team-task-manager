import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllUsers = asyncHandler(async (req, res) => {
  // Fetch all users except their passwords
  const users = await User.find().select("-password");
  
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

export { getAllUsers };
