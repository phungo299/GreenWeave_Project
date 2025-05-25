import express from "express";
import {
  checkEmail,
  checkUsername,
  forgotPassword,
  login,
  loginAdmin,
  loginWithGoogle,
  logout,
  register,
  resetPassword,
  sendNewVerifyEmail,
  verifyEmail,
  verifyResetOTP,
  checkVerificationStatus
} from "../controllers/authController";

const router = express.Router();
router.post("/register", register);
router.post("/verify-email", verifyEmail); // app password
router.post("/new-verify", sendNewVerifyEmail);
router.post("/check-verification", checkVerificationStatus);
router.post("/login", login);
router.post("/login-google", loginWithGoogle);
router.post("/login-admin", loginAdmin);
router.post("/logout", logout);
router.post("/check-username", checkUsername);
router.post("/check-email", checkEmail);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

export default router;
