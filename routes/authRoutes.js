import express from "express";
import { login, register } from "../controllers/authController.js";

const router = express.Router();

// Kirjautumisreitti
router.post("/login", login);

// Rekisteröitymisreitti
router.post("/register", register);

export default router;