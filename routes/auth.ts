import express from "express";
import {
  AuthenticateTwitter,
  TwitterCallback,
} from "../controllers/auth.controller";

const router = express.Router();

router.get("/authorize", AuthenticateTwitter);
router.get("/callback", TwitterCallback);

export default router;
