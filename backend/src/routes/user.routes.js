import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllUsers } from "../controllers/user.controller.js";

const router = Router();

// Require authentication for fetching users
router.use(verifyJWT);

router.route("/").get(getAllUsers);

export default router;
