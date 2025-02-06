import express from "express";
import {
  AuthenticateTwitter,
  loginUser,
  TwitterCallback,
} from "../controllers/auth.controller";

const router = express.Router();

router.get("/authorize", AuthenticateTwitter);
router.post("/login", loginUser);
router.get("/callback", TwitterCallback);

export default router;
