import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Server is running smoothly"));
  })
);

export default router;
